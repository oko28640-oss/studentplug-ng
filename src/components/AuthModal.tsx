import React, { useState, useMemo } from 'react';
import { X, UserPlus, LogIn, Building2, CheckCircle, GraduationCap, Sparkles, BookOpen } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { StudentLevel, Institution } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    registerStudent, 
    allUsers, 
    switchUser, 
    showToast, 
    institutions,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset
  } = useMarket();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [school, setSchool] = useState<string>(() => institutions[0]?.name || 'University of Lagos');
  const [campus, setCampus] = useState<string>(() => institutions[0]?.campuses[0] || 'Akoka (Main Campus)');
  const [faculty, setFaculty] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [programme, setProgramme] = useState<string>('');
  const [level, setLevel] = useState<StudentLevel>('200L');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const currentInstitution = useMemo(() => {
    return institutions.find(i => i.name === school) || institutions[0];
  }, [institutions, school]);

  if (!isOpen) return null;

  const handleSchoolChange = (newSchoolName: string) => {
    setSchool(newSchoolName);
    const inst = institutions.find(i => i.name === newSchoolName);
    if (inst) {
      if (inst.campuses && inst.campuses.length > 0) {
        setCampus(inst.campuses[0]);
      }
      if (inst.faculties && inst.faculties.length > 0) {
        setFaculty(inst.faculties[0]);
      }
      if (inst.departments && inst.departments.length > 0) {
        setDepartment(inst.departments[0]);
      }
      if (inst.programmes && inst.programmes.length > 0) {
        setProgramme(inst.programmes[0]);
      }
      if (inst.category === 'Polytechnic') {
        setLevel('ND I');
      } else if (inst.category === 'College of Education') {
        setLevel('NCE I');
      } else if (inst.category === 'College of Nursing Sciences') {
        setLevel('Year 1');
      } else {
        setLevel('100L');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !emailOrPhone.trim()) {
      showToast('Please fill in your name and student email/phone.');
      return;
    }

    const isEmail = emailOrPhone.includes('@');
    const validEmail = isEmail ? emailOrPhone.trim() : `${fullName.toLowerCase().replace(/\s+/g, '')}@student.edu.ng`;
    const pwd = password.length >= 6 ? password : 'studentpassword123';

    setLoading(true);
    try {
      await signUpWithEmail(validEmail, pwd, {
        fullName: fullName.trim(),
        email: validEmail,
        phone: !isEmail ? emailOrPhone.trim() : '+234 812 000 0000',
        school,
        campus,
        department: department.trim() || 'Student Department',
        programme: programme.trim() || undefined,
        level,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?auto=format&fit=crop&w=300&q=80`,
      });
      onClose();
    } catch (err) {
      // Fallback local register
      registerStudent({
        fullName: fullName.trim(),
        email: validEmail,
        phone: !isEmail ? emailOrPhone.trim() : '+234 812 000 0000',
        school,
        campus,
        department: department.trim() || 'Student Department',
        programme: programme.trim() || undefined,
        level,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?auto=format&fit=crop&w=300&q=80`,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter your student email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      // If local match exists, fallback gracefully
      const matched = allUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
      if (matched) {
        switchUser(matched.id);
        showToast(`Signed in as ${matched.fullName}!`);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      console.warn('Google sign in flow notice:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="auth-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {mode === 'register' ? 'Join StudentPlug NG' : 'Student Login'}
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {mode === 'register' 
                  ? 'Connect with verified students across Nigeria' 
                  : 'Select an active student demo profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 font-bold text-center transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Student Account
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 font-bold text-center transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Demo Accounts / Sign In
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Femi Adebayo, Chidinma Okafor"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                  Student Email or WhatsApp Phone *
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. student@unilag.edu.ng or 08012345678"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 focus:bg-white transition"
                  required
                />
              </div>

              {/* Nigerian Institution Selection */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                  Nigerian Tertiary Institution *
                </label>
                <select
                  value={school}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white text-xs font-semibold text-slate-800"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id || inst.name} value={inst.name}>
                      {inst.name} ({inst.shortName}) - {inst.category} [{inst.state} State]
                    </option>
                  ))}
                </select>
                {currentInstitution && (
                  <div className="text-[10px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>{currentInstitution.type} • {currentInstitution.state} State</span>
                  </div>
                )}
              </div>

              {/* Campus */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                  Campus Location
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white text-xs"
                >
                  {currentInstitution?.campuses && currentInstitution.campuses.length > 0 ? (
                    currentInstitution.campuses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  ) : (
                    <option value="Main Campus">Main Campus</option>
                  )}
                </select>
              </div>

              {/* Department & Academic Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                    Department / Course
                  </label>
                  {currentInstitution?.departments && currentInstitution.departments.length > 0 ? (
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white text-xs"
                    >
                      <option value="">Select Department...</option>
                      {currentInstitution.departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                      <option value="Other Department">Other Department</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Nursing, Accounting"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                    Academic Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as StudentLevel)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white font-medium text-xs"
                  >
                    <optgroup label="University Degree">
                      <option value="100L">100L (Freshman)</option>
                      <option value="200L">200L (Sophomore)</option>
                      <option value="300L">300L (Penultimate)</option>
                      <option value="400L">400L (Finalist)</option>
                      <option value="500L">500L (Engineering/Pharmacy/Agric)</option>
                      <option value="600L">600L (Medicine & Surgery)</option>
                    </optgroup>
                    <optgroup label="Polytechnic (National Diploma & Higher Diploma)">
                      <option value="ND I">ND I (National Diploma 1)</option>
                      <option value="ND II">ND II (National Diploma 2)</option>
                      <option value="HND I">HND I (Higher National Diploma 1)</option>
                      <option value="HND II">HND II (Higher National Diploma 2)</option>
                    </optgroup>
                    <optgroup label="College of Education (NCE)">
                      <option value="NCE I">NCE I (Year 1)</option>
                      <option value="NCE II">NCE II (Year 2)</option>
                      <option value="NCE III">NCE III (Year 3)</option>
                    </optgroup>
                    <optgroup label="Nursing, Health & Other Colleges">
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Year 5">Year 5</option>
                    </optgroup>
                    <optgroup label="Postgraduate">
                      <option value="Postgraduate">Postgraduate (PGD / MSc / PhD)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Programme / Qualification (Optional/Smart) */}
              {currentInstitution?.programmes && currentInstitution.programmes.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                    Academic Programme / Award
                  </label>
                  <select
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-white text-xs"
                  >
                    <option value="">Select Programme...</option>
                    {currentInstitution.programmes.map((prog) => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Create Student Account & Enter Campus</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                id="google-signin-button"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <div className="h-px bg-slate-200 flex-1" />
                <span>or student email</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Email & Password Sign In Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-[11px]">
                    Student Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@campus.edu.ng"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (loginEmail) {
                          await sendPasswordReset(loginEmail);
                        } else {
                          showToast('Please type your email above first.');
                        }
                      }}
                      className="text-[10px] text-emerald-700 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 focus:bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In to StudentPlug NG'}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-600 mb-2">
                  Or instant sign in as a demo student:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-1 font-bold text-xs text-slate-900">
                            <span>{u.fullName}</span>
                            {u.isVerified && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {u.role === 'admin' && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-md font-bold">ADMIN</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{u.school} • {u.level}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700">Switch &rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
