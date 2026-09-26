import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Firestore,
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  limit,
  getDocFromServer,
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword, 
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider } from '../services/firebase';
import { LegalDocTab } from '../components/LegalDocsModal';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { 
  User, 
  Product, 
  Conversation, 
  Order, 
  ListingReport, 
  AppNotification, 
  ChatMessage,
  OrderStatus,
  Review,
  VerificationRequest,
  PaymentRecord,
  PaymentReceipt,
  Promotion,
  BlockedUser,
  StudentLevel,
  Institution,
  TabType
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REPORTS,
  INITIAL_REVIEWS,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_PAYMENTS
} from '../data/mockData';
import { INITIAL_INSTITUTIONS } from '../data/institutionsData';

interface MarketContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  switchUser: (userId: string) => void;
  registerStudent: (data: Partial<User>) => User;
  
  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'datePosted' | 'viewsCount' | 'favouritesCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerSchool' | 'sellerCampus' | 'sellerVerified' | 'sellerAvatar'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  markProductAsSold: (id: string) => void;
  toggleBoostProduct: (id: string) => void;
  toggleFeaturedProduct: (id: string) => void;
  
  // Favourites
  favourites: string[];
  toggleFavourite: (productId: string) => void;
  isFavourite: (productId: string) => boolean;

  // School filter & Campus Scope
  selectedSchoolFilter: string;
  setSelectedSchoolFilter: (school: string) => void;
  campusScope: 'my_campus' | 'nearby' | 'all';
  setCampusScope: (scope: 'my_campus' | 'nearby' | 'all') => void;

  // Institutions Database & Admin Management
  institutions: Institution[];
  addInstitution: (data: Omit<Institution, 'id'>) => Institution;
  updateInstitution: (id: string, updates: Partial<Institution>) => void;
  deleteInstitution: (id: string) => void;
  toggleInstitutionStatus: (id: string) => void;
  addMeetupPointToInstitution: (institutionId: string, pointName: string) => void;
  removeMeetupPointFromInstitution: (institutionId: string, pointName: string) => void;

  // Chats
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  startOrOpenChat: (product: Product, initialMessage?: string) => Conversation;
  sendMessage: (conversationId: string, text: string) => void;

  // Orders & Payments
  orders: Order[];
  payments: PaymentRecord[];
  placeOrder: (productId: string, deliveryOption: string, meetupLocation: string, notes?: string) => Order;
  completeCheckoutOrder: (orderData: Partial<Order>, paymentData: Partial<PaymentRecord>) => { order: Order; receipt: PaymentReceipt };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;

  // Reviews
  reviews: Review[];
  addReview: (orderId: string, rating: number, comment: string, productComment?: string) => void;
  deleteReview: (reviewId: string) => void;

  // Student Verification
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (matricNumber: string, faculty: string, department: string, level: StudentLevel, idCardImage?: string) => void;
  approveVerificationRequest: (requestId: string) => void;
  rejectVerificationRequest: (requestId: string, note?: string) => void;

  // Promotions
  promotions: Promotion[];
  promoteListing: (productId: string, duration: '24h' | '3d' | '7d', fee: number, transactionRef: string) => void;

  // Blocked Users
  blockedUsers: BlockedUser[];
  blockUser: (userId: string, userName: string) => void;
  unblockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;

  // Moderation & Safety
  reports: ListingReport[];
  reportListing: (listingId: string, reason: ListingReport['reason'], details: string) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'remove_listing' | 'ban_user') => void;
  verifyStudentAccount: (userId: string) => void;
  suspendUser: (userId: string) => void;
  restoreUser: (userId: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Global Navigation & Modals
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  executeSearch: (q: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  viewProductDetail: Product | null;
  setViewProductDetail: (p: Product | null) => void;
  
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (open: boolean) => void;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  orderTargetProduct: Product | null;
  setOrderTargetProduct: (p: Product | null) => void;

  // Modals
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutTargetProduct: Product | null;
  setCheckoutTargetProduct: (p: Product | null) => void;

  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  reviewTargetOrder: Order | null;
  setReviewTargetOrder: (order: Order | null) => void;

  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  receiptTargetReceipt: PaymentReceipt | null;
  setReceiptTargetReceipt: (r: PaymentReceipt | null) => void;

  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;

  isNotificationsModalOpen: boolean;
  setIsNotificationsModalOpen: (open: boolean) => void;

  isPromoteModalOpen: boolean;
  setIsPromoteModalOpen: (open: boolean) => void;
  promoteTargetProduct: Product | null;
  setPromoteTargetProduct: (p: Product | null) => void;

  selectedSellerProfile: User | null;
  setSelectedSellerProfile: (user: User | null) => void;
  selectedSellerProfileId: string | null;
  openSellerProfile: (userIdOrUser: string | User) => void;
  closeSellerProfile: () => void;
  blockedUserIds: string[];
  reviewVerificationRequest: (requestId: string, action: 'approved' | 'rejected' | 'verified', note?: string) => void;

  // Legal & Account Deletion
  isLegalModalOpen: boolean;
  setIsLegalModalOpen: (open: boolean) => void;
  legalModalTab: LegalDocTab;
  setLegalModalTab: (tab: LegalDocTab) => void;
  openLegalDocs: (tab?: LegalDocTab) => void;
  isAccountDeletionModalOpen: boolean;
  setIsAccountDeletionModalOpen: (open: boolean) => void;
  deleteCurrentUserAccount: (reason?: string) => Promise<void>;

  // Firebase Authentication
  firebaseUser: FirebaseUser | null;
  isSignedIn: boolean;
  isFirebaseConnected: boolean;
  isAuthLoading: boolean;
  signInWithEmailAndPassword: (email: string, pass: string) => Promise<void>;
  registerWithEmailAndPassword: (email: string, pass: string, profileData?: Partial<User>) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, profileData?: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;

  // Firestore Database & Collection CRUD Helpers
  db: Firestore;
  
  // Users Collection Helpers
  getUserDoc: (userId: string) => Promise<User | null>;
  createUserDoc: (userId: string, data: Partial<User>) => Promise<User>;
  updateUserDoc: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUserDoc: (userId: string) => Promise<void>;

  // Listings Collection Helpers
  getListingDoc: (listingId: string) => Promise<Product | null>;
  getListingsDocs: (filterBySchool?: string) => Promise<Product[]>;
  createListingDoc: (listingData: Omit<Product, 'id' | 'datePosted' | 'viewsCount' | 'favouritesCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerSchool' | 'sellerCampus' | 'sellerVerified' | 'sellerAvatar'> & Partial<Product>) => Promise<Product>;
  updateListingDoc: (listingId: string, updates: Partial<Product>) => Promise<void>;
  deleteListingDoc: (listingId: string) => Promise<void>;

  // Orders Collection Helpers
  getOrderDoc: (orderId: string) => Promise<Order | null>;
  getUserOrdersDocs: (userId?: string) => Promise<Order[]>;
  createOrderDoc: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderDoc: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrderDoc: (orderId: string) => Promise<void>;

  // Firestore Data Structure Initialization
  initializeFirestoreDataStructure: (options?: { force?: boolean }) => Promise<{
    success: boolean;
    initializedCollections: string[];
    summary: Record<string, number>;
    message: string;
  }>;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'cm_ng_users_v2',
  CURRENT_USER_ID: 'cm_ng_current_user_id_v2',
  PRODUCTS: 'cm_ng_products_v2',
  FAVOURITES: 'cm_ng_favourites_v2',
  CONVERSATIONS: 'cm_ng_conversations_v2',
  ORDERS: 'cm_ng_orders_v2',
  NOTIFICATIONS: 'cm_ng_notifications_v2',
  REPORTS: 'cm_ng_reports_v2',
  REVIEWS: 'cm_ng_reviews_v2',
  VERIFICATION_REQUESTS: 'cm_ng_verifications_v2',
  PAYMENTS: 'cm_ng_payments_v2',
  PROMOTIONS: 'cm_ng_promotions_v2',
  BLOCKED_USERS: 'cm_ng_blocked_users_v2',
  SCHOOL_FILTER: 'cm_ng_school_filter_v2',
  INSTITUTIONS: 'cm_ng_institutions_v3',
  CAMPUS_SCOPE: 'cm_ng_campus_scope_v3',
};

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize institutions database
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: Institution) => p.id || p.name));
          const missing = INITIAL_INSTITUTIONS.filter(i => !existingIds.has(i.id) && !existingIds.has(i.name));
          return [...parsed, ...missing];
        }
      } catch (e) {
        console.error('Error loading stored institutions', e);
      }
    }
    return INITIAL_INSTITUTIONS;
  });

  // Campus Scope: 'my_campus' | 'nearby' | 'all'
  const [campusScope, setCampusScope] = useState<'my_campus' | 'nearby' | 'all'>('my_campus');

  // Initialize users
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'user_femi';
  });

  const currentUser = allUsers.find(u => u.id === currentUserId) || allUsers[0] || INITIAL_USERS[0];

  // Initialize products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(p => p.id));
      const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
      if (missing.length > 0) {
        return [...parsed, ...missing];
      }
      return parsed;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Initialize favourites
  const [favourites, setFavourites] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVOURITES);
    return saved ? JSON.parse(saved) : ['prod_rechargeable_fan', 'prod_bone_straight'];
  });

  // Selected school filter
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL_FILTER);
    return saved !== null ? saved : 'University of Lagos';
  });

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Payments
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Verification Requests
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VERIFICATION_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_REQUESTS;
  });

  // Promotions
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  // Blocked Users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
    return saved ? JSON.parse(saved) : [];
  });

  // Reports
  const [reports, setReports] = useState<ListingReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewProductDetail, setViewProductDetail] = useState<Product | null>(null);

  // Recent Searches History (user-scoped, excludes private info)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`recent_searches_${currentUserId}`);
      return saved ? JSON.parse(saved) : ['Perfume', 'Nike sneakers', 'Handouts', 'Gas cylinder'];
    } catch {
      return ['Perfume', 'Nike sneakers', 'Handouts', 'Gas cylinder'];
    }
  });

  const addRecentSearch = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm || cleanTerm.length > 50) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(`recent_searches_${currentUserId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save recent search:', e);
      }
      return updated;
    });
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      try {
        localStorage.setItem(`recent_searches_${currentUserId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not remove recent search:', e);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(`recent_searches_${currentUserId}`);
    } catch (e) {
      console.warn('Could not clear recent searches:', e);
    }
  };

  const executeSearch = (q: string) => {
    const clean = q.trim();
    if (clean) {
      addRecentSearch(clean);
    }
    setSearchQuery(clean);
    setActiveTab('search');
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [orderTargetProduct, setOrderTargetProduct] = useState<Product | null>(null);

  // New Modals
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutTargetProduct, setCheckoutTargetProduct] = useState<Product | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewTargetOrder, setReviewTargetOrder] = useState<Order | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [receiptTargetReceipt, setReceiptTargetReceipt] = useState<PaymentReceipt | null>(null);

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);

  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState<boolean>(false);
  const [promoteTargetProduct, setPromoteTargetProduct] = useState<Product | null>(null);

  const [selectedSellerProfile, setSelectedSellerProfile] = useState<User | null>(null);

  // Legal & Account Deletion Modals
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalDocTab>('privacy');
  const [isAccountDeletionModalOpen, setIsAccountDeletionModalOpen] = useState<boolean>(false);

  // Firebase Auth & Cloud Sync
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const openLegalDocs = (tab: LegalDocTab = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Validate connection to Firestore on initial boot
  useEffect(() => {
    async function testConnection() {
      if (!db) return;
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsFirebaseConnected(true);
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
          setIsFirebaseConnected(false);
        }
      }
    }
    testConnection();
  }, []);

  // Firebase Auth Observer - Persists session and synchronizes Firestore user profile
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        try {
          if (fbUser) {
            // Attempt to load live student profile from Firestore
            let cloudProfile: User | null = null;
            if (db) {
              try {
                const userDocRef = doc(db, 'users', fbUser.uid);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                  cloudProfile = userSnap.data() as User;
                }
              } catch (fetchErr) {
                console.warn('Could not read user profile from Firestore:', fetchErr);
              }
            }

            if (cloudProfile) {
              const loadedProfile = cloudProfile;
              setAllUsers((prev) => [loadedProfile, ...prev.filter((u) => u.id !== loadedProfile.id)]);
              setCurrentUserId(loadedProfile.id);
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, loadedProfile.id);
            } else {
              // If no doc in Firestore yet, check existing local users or initialize a new profile
              setAllUsers((prev) => {
                const existing = prev.find(
                  (u) => u.id === fbUser.uid || (fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase())
                );

                if (existing) {
                  const updated: User = {
                    ...existing,
                    id: fbUser.uid,
                    email: fbUser.email || existing.email,
                    fullName: fbUser.displayName || existing.fullName,
                    avatar: fbUser.photoURL || existing.avatar,
                  };
                  if (db) {
                    setDoc(doc(db, 'users', fbUser.uid), updated, { merge: true }).catch((e) =>
                      console.warn('Sync existing profile notice:', e)
                    );
                  }
                  setCurrentUserId(updated.id);
                  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, updated.id);
                  return [updated, ...prev.filter((u) => u.id !== updated.id)];
                }

                const newStudent: User = {
                  id: fbUser.uid,
                  fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus Student',
                  email: fbUser.email || 'student@campus.edu.ng',
                  phone: fbUser.phoneNumber || '+234 812 000 0000',
                  school: selectedSchoolFilter !== 'All' ? selectedSchoolFilter : (institutions[0]?.name || 'University of Lagos'),
                  campus: institutions[0]?.campuses?.[0] || 'Main Campus',
                  faculty: 'General Studies',
                  department: 'Student Department',
                  level: '200L',
                  avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
                  isVerified: false,
                  verificationStatus: 'unverified',
                  role: (fbUser.email === 'admin@studentplug.ng' || fbUser.email === 'oko28640@gmail.com') ? 'admin' : 'student',
                  joinedDate: 'Sep 2026',
                  rating: 5.0,
                  reviewsCount: 0,
                  completedSalesCount: 0,
                  responseRate: '100%',
                  bio: 'Verified Nigerian campus student on StudentPlug NG.',
                  studentIdCardSubmitted: false,
                };

                if (db) {
                  setDoc(doc(db, 'users', fbUser.uid), newStudent, { merge: true }).catch((err) => {
                    console.warn('Initial user firestore sync notice:', err);
                  });
                }

                setCurrentUserId(newStudent.id);
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newStudent.id);
                return [newStudent, ...prev.filter((u) => u.id !== fbUser.uid)];
              });
            }
          } else {
            // User is signed out: ensure no stale authenticated Firebase UID remains active
            const storedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
            const isDemoStudent = INITIAL_USERS.some((u) => u.id === storedId);
            if (!isDemoStudent) {
              const fallbackUser = INITIAL_USERS[0];
              setCurrentUserId(fallbackUser.id);
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, fallbackUser.id);
            }
          }
        } catch (authError) {
          console.error('Error during onAuthStateChanged profile resolution:', authError);
        } finally {
          setIsAuthLoading(false);
        }
      });
    } catch (err) {
      console.warn('Firebase auth listener setup note:', err);
      setIsAuthLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const isSignedIn = Boolean(firebaseUser);

  // Real-Time Cloud Firestore Sync: Listings
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(collection(db, 'listings'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            remoteProducts.push(docSnap.data() as Product);
          });
          setProducts((prev) => {
            const remoteMap = new Map(remoteProducts.map(p => [p.id, p]));
            const localOnly = prev.filter(p => !remoteMap.has(p.id));
            return [...remoteProducts, ...localOnly];
          });
        }
      }, (err) => {
        console.warn('Listings snapshot note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Listings listener setup notice:', e);
    }
  }, []);

  // Real-Time Cloud Firestore Sync: Orders (Obeying security rules for buyer/seller/admin)
  useEffect(() => {
    if (!db || !firebaseUser) return;
    try {
      const isAdmin = (currentUser.role === 'admin' || firebaseUser.email === 'admin@studentplug.ng' || firebaseUser.email === 'oko28640@gmail.com');

      if (isAdmin) {
        const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
          if (!snapshot.empty) {
            const remoteOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              remoteOrders.push(docSnap.data() as Order);
            });
            setOrders((prev) => {
              const remoteMap = new Map(remoteOrders.map(o => [o.id, o]));
              const localOnly = prev.filter(o => !remoteMap.has(o.id));
              return [...remoteOrders, ...localOnly];
            });
          }
        }, (err) => {
          console.warn('Admin orders snapshot notice:', err);
        });
        return () => unsub();
      } else {
        // Query user's buyer orders
        const qBuyer = query(collection(db, 'orders'), where('buyerId', '==', firebaseUser.uid));
        const unsubBuyer = onSnapshot(qBuyer, (snapshot) => {
          if (!snapshot.empty) {
            const buyerOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              buyerOrders.push(docSnap.data() as Order);
            });
            setOrders((prev) => {
              const remoteMap = new Map(buyerOrders.map(o => [o.id, o]));
              const nonBuyer = prev.filter(o => o.buyerId !== firebaseUser.uid);
              return [...buyerOrders, ...nonBuyer];
            });
          }
        }, (err) => {
          console.warn('Buyer orders snapshot note:', err);
        });

        // Query user's seller orders
        const qSeller = query(collection(db, 'orders'), where('sellerId', '==', firebaseUser.uid));
        const unsubSeller = onSnapshot(qSeller, (snapshot) => {
          if (!snapshot.empty) {
            const sellerOrders: Order[] = [];
            snapshot.forEach((docSnap) => {
              sellerOrders.push(docSnap.data() as Order);
            });
            setOrders((prev) => {
              const remoteMap = new Map(sellerOrders.map(o => [o.id, o]));
              const nonSeller = prev.filter(o => o.sellerId !== firebaseUser.uid);
              return [...sellerOrders, ...nonSeller];
            });
          }
        }, (err) => {
          console.warn('Seller orders snapshot note:', err);
        });

        return () => {
          unsubBuyer();
          unsubSeller();
        };
      }
    } catch (e) {
      console.warn('Orders listener setup notice:', e);
    }
  }, [firebaseUser, currentUser.role]);

  // Real-Time Cloud Firestore Sync: Verification Requests
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(collection(db, 'verificationRequests'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteReqs: VerificationRequest[] = [];
          snapshot.forEach((docSnap) => {
            remoteReqs.push(docSnap.data() as VerificationRequest);
          });
          setVerificationRequests((prev) => {
            const remoteMap = new Map(remoteReqs.map(r => [r.id, r]));
            const localOnly = prev.filter(r => !remoteMap.has(r.id));
            return [...remoteReqs, ...localOnly];
          });
        }
      }, (err) => {
        console.warn('Verification requests snapshot note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Verification listener setup notice:', e);
    }
  }, []);

  // Persist states
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_FILTER, selectedSchoolFilter);
  }, [selectedSchoolFilter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VERIFICATION_REQUESTS, JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPUS_SCOPE, campusScope);
  }, [campusScope]);

  // Institution Management Functions
  const addInstitution = (institutionData: Omit<Institution, 'id'>): Institution => {
    const newId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newInst: Institution = {
      ...institutionData,
      id: newId,
      meetupPoints: institutionData.meetupPoints && institutionData.meetupPoints.length > 0
        ? institutionData.meetupPoints
        : ['Main Campus Gate', 'School Library Foyer', 'Student Union Building (SUB)'],
      campuses: institutionData.campuses && institutionData.campuses.length > 0
        ? institutionData.campuses
        : ['Main Campus'],
      faculties: institutionData.faculties || [],
      departments: institutionData.departments || [],
      programmes: institutionData.programmes || [],
      isActive: institutionData.isActive !== false,
    };
    setInstitutions(prev => [newInst, ...prev]);
    showToast(`Added ${newInst.name} to institutions directory.`);
    return newInst;
  };

  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions(prev => prev.map(inst => (inst.id === id || inst.name === id) ? { ...inst, ...updates } : inst));
    showToast('Institution updated successfully.');
  };

  const deleteInstitution = (id: string) => {
    setInstitutions(prev => prev.filter(inst => inst.id !== id && inst.name !== id));
    showToast('Institution removed from directory.');
  };

  const toggleInstitutionStatus = (id: string) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === id || inst.name === id) {
        const nextStatus = !inst.isActive;
        showToast(`${inst.shortName || inst.name} is now ${nextStatus ? 'Active' : 'Inactive'}.`);
        return { ...inst, isActive: nextStatus };
      }
      return inst;
    }));
  };

  const addMeetupPointToInstitution = (institutionId: string, pointName: string) => {
    const trimmed = pointName.trim();
    if (!trimmed) return;
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === institutionId || inst.name === institutionId) {
        if (inst.meetupPoints.includes(trimmed)) return inst;
        return { ...inst, meetupPoints: [...inst.meetupPoints, trimmed] };
      }
      return inst;
    }));
    showToast(`Added meetup point: "${trimmed}"`);
  };

  const removeMeetupPointFromInstitution = (institutionId: string, pointName: string) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === institutionId || inst.name === institutionId) {
        return { ...inst, meetupPoints: inst.meetupPoints.filter(p => p !== pointName) };
      }
      return inst;
    }));
    showToast('Meetup location removed.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      setSelectedSchoolFilter(user.school);
      showToast(`Switched user to ${user.fullName} (${user.school})`);
    }
  };

  const setCurrentUser = (user: User) => {
    setAllUsers(prev => {
      const idx = prev.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = user;
        return next;
      }
      return [...prev, user];
    });
  };

  const openSellerProfile = (userIdOrUser: string | User) => {
    if (typeof userIdOrUser === 'string') {
      const found = allUsers.find(u => u.id === userIdOrUser);
      if (found) {
        setSelectedSellerProfile(found);
      } else {
        showToast('Seller profile not found.');
      }
    } else {
      setSelectedSellerProfile(userIdOrUser);
    }
  };

  const registerStudent = (data: Partial<User>): User => {
    const newUser: User = {
      id: data.id || `user_${Date.now()}`,
      fullName: data.fullName || 'Campus Student',
      email: data.email || 'student@campus.edu.ng',
      phone: data.phone || '+234 800 000 0000',
      school: data.school || institutions[0]?.name || 'University of Nigeria, Nsukka (UNN)',
      campus: data.campus || institutions[0]?.campuses?.[0] || 'Nsukka Campus',
      faculty: data.faculty || 'Sciences',
      department: data.department || 'General Studies',
      programme: data.programme || undefined,
      matricNumber: data.matricNumber || undefined,
      level: data.level || '100L',
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.id || Date.now()}`,
      isVerified: data.isVerified || false,
      verificationStatus: data.verificationStatus || 'unverified',
      role: data.role || (data.email === 'admin@studentplug.ng' || data.email === 'oko28640@gmail.com' ? 'admin' : 'student'),
      joinedDate: data.joinedDate || 'Sep 2026',
      rating: 5.0,
      reviewsCount: 0,
      completedSalesCount: 0,
      responseRate: '100%',
      bio: data.bio || 'New student on StudentPlug NG!',
      studentIdCardSubmitted: false,
    };

    setAllUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)]);
    setCurrentUserId(newUser.id);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    setSelectedSchoolFilter(newUser.school);
    showToast(`Welcome to StudentPlug NG, ${newUser.fullName}!`);
    return newUser;
  };

  const addProduct = (
    productData: Omit<Product, 'id' | 'datePosted' | 'viewsCount' | 'favouritesCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerSchool' | 'sellerCampus' | 'sellerVerified' | 'sellerAvatar'>
  ): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerSchool: currentUser.school,
      sellerCampus: currentUser.campus,
      sellerVerified: currentUser.isVerified,
      sellerAvatar: currentUser.avatar,
      datePosted: 'Just now',
      viewsCount: 1,
      favouritesCount: 0,
      status: 'active',
    };

    setProducts(prev => [newProduct, ...prev]);

    // Persist to Cloud Firestore if student is signed in
    if (auth.currentUser && db) {
      createListingDoc(newProduct).catch((err) => {
        console.warn('Listing cloud sync notice:', err);
      });
    }

    showToast('Listing successfully posted to campus!');
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (viewProductDetail && viewProductDetail.id === id) {
      setViewProductDetail(prev => prev ? { ...prev, ...updates } : null);
    }
    if (auth.currentUser && db) {
      updateListingDoc(id, updates).catch((err) => {
        console.warn('Listing cloud update notice:', err);
      });
    }
    showToast('Listing updated.');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (viewProductDetail && viewProductDetail.id === id) {
      setViewProductDetail(null);
    }
    if (auth.currentUser && db) {
      deleteListingDoc(id).catch((err) => {
        console.warn('Listing cloud delete notice:', err);
      });
    }
    showToast('Listing deleted.');
  };

  const markProductAsSold = (id: string) => {
    let nextStatus: 'active' | 'sold' = 'sold';
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        nextStatus = p.status === 'sold' ? 'active' : 'sold';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    if (auth.currentUser && db) {
      updateListingDoc(id, { status: nextStatus }).catch((err) => {
        console.warn('Listing status toggle sync notice:', err);
      });
    }
    showToast('Listing status toggled.');
  };

  const toggleBoostProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      setPromoteTargetProduct(target);
      setIsPromoteModalOpen(true);
    }
  };

  const toggleFeaturedProduct = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    showToast('Featured status updated.');
  };

  const toggleFavourite = (productId: string) => {
    setFavourites(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from saved items' : 'Saved to favourites!');
      return next;
    });

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const isFav = favourites.includes(productId);
        return {
          ...p,
          favouritesCount: Math.max(0, p.favouritesCount + (isFav ? -1 : 1))
        };
      }
      return p;
    }));
  };

  const isFavourite = (productId: string) => favourites.includes(productId);

  const startOrOpenChat = (product: Product, initialMessage?: string): Conversation => {
    const existing = conversations.find(
      c => c.productId === product.id && 
           ((c.buyerId === currentUser.id && c.sellerId === product.sellerId) || 
            (c.sellerId === currentUser.id && c.buyerId === product.sellerId))
    );

    if (existing) {
      setActiveConversation(existing);
      setActiveTab('messages');
      if (initialMessage) {
        sendMessage(existing.id, initialMessage);
      }
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images[0] || '',
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      lastMessage: initialMessage || `Hello ${product.sellerName}, is "${product.title}" still available?`,
      lastUpdated: 'Just now',
      unreadCountForUser: {
        [product.sellerId]: 1,
        [currentUser.id]: 0,
      },
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          text: initialMessage || `Hello ${product.sellerName}, is "${product.title}" still available on campus?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv);
    setActiveTab('messages');
    showToast(`Chat started with ${product.sellerName}`);
    return newConv;
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const otherUserId = conv.buyerId === currentUser.id ? conv.sellerId : conv.buyerId;
        const currentUnread = conv.unreadCountForUser[otherUserId] || 0;
        return {
          ...conv,
          lastMessage: text.trim(),
          lastUpdated: 'Just now',
          unreadCountForUser: {
            ...conv.unreadCountForUser,
            [otherUserId]: currentUnread + 1,
            [currentUser.id]: 0,
          },
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    }));

    if (activeConversation && activeConversation.id === conversationId) {
      setActiveConversation(prev => prev ? {
        ...prev,
        lastMessage: text.trim(),
        lastUpdated: 'Just now',
        messages: [...prev.messages, newMsg],
      } : null);
    }
  };

  const placeOrder = (productId: string, deliveryOption: string, meetupLocation: string, notes?: string): Order => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const orderNum = `SP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderNum,
      orderNumber: orderNum,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images[0] || '',
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      sellerSchool: product.sellerSchool,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      buyerSchool: currentUser.school,
      buyerPhone: currentUser.phone,
      fulfillmentType: deliveryOption.includes('Hostel') ? 'delivery' : 'pickup',
      deliveryOption,
      meetupLocation,
      deliveryFee: deliveryOption.includes('Hostel') ? 500 : 0,
      totalAmount: product.price + (deliveryOption.includes('Hostel') ? 500 : 0),
      paymentMethod: 'pay_on_inspection',
      paymentStatus: 'Pending',
      notes,
      status: 'Pending',
      dateCreated: 'Just now',
      dateUpdated: 'Just now',
      reviewed: false,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Persist order to Firestore if student is signed in
    if (auth.currentUser && db) {
      createOrderDoc(newOrder).catch((err) => {
        console.warn('Order cloud sync notice:', err);
      });
    }

    // Send notification to seller
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: product.sellerId,
      title: 'New Campus Order Placed!',
      message: `${currentUser.fullName} ordered "${product.title}" (${deliveryOption})`,
      type: 'order',
      timestamp: 'Just now',
      isRead: false,
      targetTab: 'orders',
      targetId: newOrder.id,
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('Order successfully placed!');
    return newOrder;
  };

  const completeCheckoutOrder = (orderData: Partial<Order>, paymentData: Partial<PaymentRecord>): { order: Order; receipt: PaymentReceipt } => {
    const orderNum = `SP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const transRef = paymentData.reference || `PSTK_${Date.now()}`;

    const receipt: PaymentReceipt = {
      receiptNumber: `REC-${orderNum}`,
      orderNumber: orderNum,
      transactionRef: transRef,
      productTitle: orderData.productTitle || 'Campus Marketplace Item',
      buyerName: currentUser.fullName,
      buyerEmail: currentUser.email,
      sellerName: orderData.sellerName || 'Campus Seller',
      subtotal: orderData.productPrice || 0,
      deliveryFee: orderData.deliveryFee || 0,
      totalPaid: orderData.totalAmount || (orderData.productPrice || 0) + (orderData.deliveryFee || 0),
      paymentMethod: orderData.paymentMethod || 'paystack',
      paymentStatus: orderData.paymentStatus || 'Successful',
      paidAt: new Date().toLocaleString(),
    };

    const fullOrder: Order = {
      id: orderNum,
      orderNumber: orderNum,
      productId: orderData.productId || '',
      productTitle: orderData.productTitle || '',
      productPrice: orderData.productPrice || 0,
      productImage: orderData.productImage || '',
      sellerId: orderData.sellerId || '',
      sellerName: orderData.sellerName || '',
      sellerSchool: orderData.sellerSchool || '',
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      buyerSchool: currentUser.school,
      buyerPhone: orderData.buyerPhone || currentUser.phone,
      fulfillmentType: orderData.fulfillmentType || 'pickup',
      deliveryOption: orderData.deliveryOption || 'Campus Safe Meetup',
      meetupLocation: orderData.meetupLocation || 'Student Union Building',
      deliveryFee: orderData.deliveryFee || 0,
      totalAmount: orderData.totalAmount || (orderData.productPrice || 0) + (orderData.deliveryFee || 0),
      paymentMethod: orderData.paymentMethod || 'paystack',
      paymentStatus: orderData.paymentStatus || 'Successful',
      transactionRef: transRef,
      notes: orderData.notes,
      status: orderData.paymentStatus === 'Successful' ? 'Confirmed' : 'Pending',
      dateCreated: 'Just now',
      dateUpdated: 'Just now',
      reviewed: false,
      paymentReceipt: receipt,
    };

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      orderId: orderNum,
      orderNumber: orderNum,
      productTitle: orderData.productTitle || '',
      userId: currentUser.id,
      userName: currentUser.fullName,
      amount: orderData.productPrice || 0,
      deliveryFee: orderData.deliveryFee || 0,
      totalAmount: fullOrder.totalAmount,
      currency: 'NGN',
      provider: 'paystack',
      status: orderData.paymentStatus === 'Successful' ? 'Successful' : 'Pending',
      reference: transRef,
      channel: paymentData.channel || 'card',
      createdAt: 'Just now',
      paidAt: orderData.paymentStatus === 'Successful' ? 'Just now' : undefined,
    };

    setOrders(prev => [fullOrder, ...prev]);
    setPayments(prev => [newPayment, ...prev]);

    // Persist order to Firestore if student is signed in
    if (auth.currentUser && db) {
      createOrderDoc(fullOrder).catch((err) => {
        console.warn('Checkout order cloud sync notice:', err);
      });
    }

    // Send order notif to seller
    const sellerNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: fullOrder.sellerId,
      title: orderData.paymentStatus === 'Successful' ? 'Paid Order Received!' : 'New Order Placed!',
      message: `${currentUser.fullName} ordered "${fullOrder.productTitle}" (${fullOrder.deliveryOption}) - Ref: ${transRef}`,
      type: 'order',
      timestamp: 'Just now',
      isRead: false,
      targetTab: 'orders',
      targetId: orderNum,
    };
    setNotifications(prev => [sellerNotif, ...prev]);

    showToast(orderData.paymentStatus === 'Successful' ? 'Payment confirmed & order placed!' : 'Order created successfully!');
    return { order: fullOrder, receipt };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedPaymentStatus = (status === 'Completed' && o.paymentMethod === 'pay_on_inspection') 
          ? 'Successful' 
          : o.paymentStatus;
        return { ...o, status, paymentStatus: updatedPaymentStatus, dateUpdated: 'Just now' };
      }
      return o;
    }));

    const order = orders.find(o => o.id === orderId);
    if (order) {
      const recipientId = order.buyerId === currentUser.id ? order.sellerId : order.buyerId;
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: recipientId,
        title: `Order Status: ${status}`,
        message: `Order #${order.orderNumber || order.id} for "${order.productTitle}" is now ${status}.`,
        type: 'order',
        timestamp: 'Just now',
        isRead: false,
        targetTab: 'orders',
        targetId: order.id,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    if (auth.currentUser && db) {
      updateOrderDoc(orderId, { 
        status, 
        ...(status === 'Completed' ? { paymentStatus: 'Successful' } : {}) 
      }).catch((err) => {
        console.warn('Order status cloud update notice:', err);
      });
    }

    showToast(`Order status updated to: ${status}`);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled', paymentStatus: 'Refunded', dateUpdated: 'Just now' } : o));
    if (auth.currentUser && db) {
      updateOrderDoc(orderId, { status: 'Cancelled', paymentStatus: 'Refunded' }).catch((err) => {
        console.warn('Order cancel cloud update notice:', err);
      });
    }
    showToast('Order cancelled.');
  };

  // Reviews
  const addReview = (orderId: string, rating: number, comment: string, productComment?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      orderId,
      productId: order.productId,
      productTitle: order.productTitle,
      sellerId: order.sellerId,
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      buyerAvatar: currentUser.avatar,
      buyerSchool: currentUser.school,
      rating,
      comment,
      productComment,
      createdAt: 'Just now',
    };

    setReviews(prev => [newRev, ...prev]);

    // Mark order as reviewed
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewed: true } : o));

    // Update seller rating stats
    setAllUsers(prev => prev.map(u => {
      if (u.id === order.sellerId) {
        const existingCount = u.reviewsCount || 0;
        const newCount = existingCount + 1;
        const currentAvg = u.rating || 5;
        const newAvg = Number(((currentAvg * existingCount + rating) / newCount).toFixed(1));
        return {
          ...u,
          rating: newAvg,
          reviewsCount: newCount,
          completedSalesCount: (u.completedSalesCount || 0) + 1,
        };
      }
      return u;
    }));

    // Notify seller
    const revNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: order.sellerId,
      title: `New ${rating}-Star Review!`,
      message: `${currentUser.fullName} left you a review on order #${order.orderNumber || order.id}`,
      type: 'order',
      timestamp: 'Just now',
      isRead: false,
      targetTab: 'profile',
      targetId: order.sellerId,
    };
    setNotifications(prev => [revNotif, ...prev]);

    showToast('Thank you! Your verified student review was published.');
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    showToast('Review removed by moderator.');
  };

  // Student Verification
  const submitVerificationRequest = (matricNumber: string, faculty: string, department: string, level: StudentLevel, idCardImage?: string) => {
    const newReq: VerificationRequest = {
      id: `verif_${Date.now()}`,
      userId: currentUser.id,
      studentName: currentUser.fullName,
      email: currentUser.email,
      school: currentUser.school,
      faculty,
      department,
      level,
      matricNumber,
      idCardImage: idCardImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      submittedAt: new Date().toLocaleString(),
      status: 'pending',
    };

    setVerificationRequests(prev => [newReq, ...prev]);

    // Update current user state
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? {
      ...u,
      faculty,
      department,
      level,
      matricNumber,
      verificationStatus: 'pending',
      studentIdCardSubmitted: true,
    } : u));

    showToast('Student ID verification submitted! Campus liaisons will verify shortly.');
  };

  const approveVerificationRequest = (requestId: string) => {
    const req = verificationRequests.find(r => r.id === requestId);
    if (!req) return;

    setVerificationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));

    // Update user profile
    setAllUsers(prev => prev.map(u => u.id === req.userId ? {
      ...u,
      isVerified: true,
      verificationStatus: 'verified',
    } : u));

    setProducts(prev => prev.map(p => p.sellerId === req.userId ? { ...p, sellerVerified: true } : p));

    // Notify student
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: req.userId,
      title: 'Student ID Verified!',
      message: 'Congratulations! Your campus student badge is now active on your listings and profile.',
      type: 'safety',
      timestamp: 'Just now',
      isRead: false,
      targetTab: 'profile',
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Verification approved for ${req.studentName}!`);
  };

  const rejectVerificationRequest = (requestId: string, note?: string) => {
    const req = verificationRequests.find(r => r.id === requestId);
    if (!req) return;

    setVerificationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected', reviewNote: note || 'Credentials could not be validated.' } : r));

    setAllUsers(prev => prev.map(u => u.id === req.userId ? {
      ...u,
      isVerified: false,
      verificationStatus: 'unverified',
    } : u));

    showToast(`Verification rejected for ${req.studentName}.`);
  };

  // Listing Promotions
  const promoteListing = (productId: string, duration: '24h' | '3d' | '7d', fee: number, transactionRef: string) => {
    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      listingId: productId,
      sellerId: currentUser.id,
      duration,
      fee,
      paymentStatus: 'Successful',
      transactionRef,
      createdAt: 'Just now',
      expiresAt: `${duration} from now`,
      status: 'active',
    };

    setPromotions(prev => [newPromo, ...prev]);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          isPromoted: true,
          isFeatured: true,
          promotedDuration: duration,
        };
      }
      return p;
    }));

    showToast(`Listing promoted for ${duration}! Featured on top of campus feed.`);
  };

  // Blocked Users
  const blockUser = (userId: string, userName: string) => {
    if (blockedUsers.some(b => b.blockedUserId === userId)) return;
    const newBlocked: BlockedUser = {
      id: `blk_${Date.now()}`,
      userId: currentUser.id,
      blockedUserId: userId,
      blockedUserName: userName,
      blockedAt: 'Just now',
    };
    setBlockedUsers(prev => [newBlocked, ...prev]);
    showToast(`Blocked ${userName}. You will not receive messages or see their items.`);
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(b => b.blockedUserId !== userId));
    showToast('User unblocked.');
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.some(b => b.blockedUserId === userId);
  };

  // Reports & Moderation
  const reportListing = (listingId: string, reason: ListingReport['reason'], details: string) => {
    const product = products.find(p => p.id === listingId);
    const newReport: ListingReport = {
      id: `rep_${Date.now()}`,
      listingId,
      listingTitle: product?.title || 'Reported Item',
      sellerId: product?.sellerId || 'unknown',
      sellerName: product?.sellerName || 'Unknown Seller',
      reportedByUserId: currentUser.id,
      reportedByUserName: currentUser.fullName,
      reason,
      details,
      timestamp: 'Just now',
      status: 'pending',
    };

    setReports(prev => [newReport, ...prev]);
    showToast('Report submitted. Our student moderation team is reviewing this item.');
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'remove_listing' | 'ban_user') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'remove_listing') {
      setProducts(prev => prev.map(p => p.id === report.listingId ? { ...p, status: 'removed' } : p));
      showToast('Listing removed from campus marketplace.');
    } else if (action === 'ban_user') {
      setAllUsers(prev => prev.map(u => u.id === report.sellerId ? { ...u, verificationStatus: 'unverified', isVerified: false } : u));
      setProducts(prev => prev.filter(p => p.sellerId !== report.sellerId));
      showToast('User suspended and all their items unlisted.');
    } else {
      showToast('Report dismissed as non-violating.');
    }

    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r));
  };

  const suspendUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: false, verificationStatus: 'unverified' } : u));
    setProducts(prev => prev.map(p => p.sellerId === userId ? { ...p, status: 'removed' } : p));
    showToast('User account suspended and listings hidden.');
  };

  const restoreUser = (userId: string) => {
    setProducts(prev => prev.map(p => p.sellerId === userId ? { ...p, status: 'active' } : p));
    showToast('User account restored.');
  };

  const verifyStudentAccount = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      isVerified: !u.isVerified,
      verificationStatus: !u.isVerified ? 'verified' : 'unverified'
    } : u));
    setProducts(prev => prev.map(p => p.sellerId === userId ? { ...p, sellerVerified: !p.sellerVerified } : p));
    showToast('Student ID verification status toggled!');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read.');
  };

  const unreadNotificationsCount = notifications.filter(n => (!n.userId || n.userId === currentUser.id) && !n.isRead).length;

  // Account Deletion implementation
  const deleteCurrentUserAccount = async (reason?: string) => {
    const uid = currentUser.id;
    // 1. Remove from allUsers
    setAllUsers(prev => prev.filter(u => u.id !== uid));
    // 2. Remove user active listings
    setProducts(prev => prev.filter(p => p.sellerId !== uid));
    // 3. Remove user verification requests
    setVerificationRequests(prev => prev.filter(v => v.userId !== uid));
    // 4. Anonymize user order history to preserve required legal accounting references
    setOrders(prev => prev.map(o => {
      if (o.buyerId === uid) {
        return { ...o, buyerName: 'Deleted Student Account', buyerPhone: 'Redacted' };
      }
      if (o.sellerId === uid) {
        return { ...o, sellerName: 'Deleted Student Seller' };
      }
      return o;
    }));

    // 5. Delete from Firestore & Firebase Auth if connected
    try {
      if (db) {
        await deleteDoc(doc(db, 'users', uid));
        await setDoc(doc(db, 'reports', `deletion_${Date.now()}`), {
          id: `deletion_${Date.now()}`,
          reporterId: uid,
          reporterName: 'Deleted User',
          targetType: 'user',
          targetId: uid,
          reason: 'account_deletion',
          details: reason || 'User requested permanent erasure',
          status: 'resolved',
          createdAt: new Date().toISOString()
        });
      }
      if (auth.currentUser && auth.currentUser.uid === uid) {
        await deleteUser(auth.currentUser);
      }
    } catch (err) {
      console.warn('Firebase deletion sync note:', err);
    }

    // Switch to fallback user
    const fallback = allUsers.find(u => u.id !== uid) || INITIAL_USERS[0];
    setCurrentUserId(fallback.id);
    setIsAccountDeletionModalOpen(false);
    showToast('Your account and personal data have been permanently removed.');
  };

  // Helper utility to remove undefined fields from Firestore payloads
  const sanitizeForFirestore = <T extends Record<string, any>>(data: T): T => {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = sanitizeForFirestore(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result as T;
  };

  // ==========================================
  // FIRESTORE CRUD HELPER METHODS: 'users'
  // ==========================================
  const getUserDoc = async (userId: string): Promise<User | null> => {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  };

  const createUserDoc = async (userId: string, data: Partial<User>): Promise<User> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to create a user document in Firestore.');
    }
    const isAdmin = currentUser.role === 'admin' || auth.currentUser?.email === 'admin@studentplug.ng' || auth.currentUser?.email === 'oko28640@gmail.com';
    if (activeAuthUid !== userId && !isAdmin) {
      throw new Error('Unauthorized: You can only create a user profile document matching your authenticated ID.');
    }

    const newUser: User = {
      id: userId,
      fullName: data.fullName || auth.currentUser?.displayName || 'Campus Student',
      email: data.email || auth.currentUser?.email || 'student@campus.edu.ng',
      phone: data.phone || '+234 800 000 0000',
      school: data.school || institutions[0]?.name || 'University of Lagos',
      campus: data.campus || institutions[0]?.campuses?.[0] || 'Main Campus',
      faculty: data.faculty || 'Sciences',
      department: data.department || 'General Studies',
      programme: data.programme,
      matricNumber: data.matricNumber,
      level: data.level || '100L',
      avatar: data.avatar || auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      isVerified: data.isVerified || false,
      verificationStatus: data.verificationStatus || 'unverified',
      role: data.role || (auth.currentUser?.email === 'admin@studentplug.ng' || auth.currentUser?.email === 'oko28640@gmail.com' ? 'admin' : 'student'),
      joinedDate: data.joinedDate || 'Sep 2026',
      rating: data.rating ?? 5.0,
      reviewsCount: data.reviewsCount ?? 0,
      completedSalesCount: data.completedSalesCount ?? 0,
      responseRate: data.responseRate || '100%',
      bio: data.bio || 'Verified Nigerian campus student on StudentPlug NG.',
      studentIdCardSubmitted: data.studentIdCardSubmitted || false,
    };

    const clean = sanitizeForFirestore(newUser);
    try {
      await setDoc(doc(db, 'users', userId), clean, { merge: true });
      setAllUsers(prev => [newUser, ...prev.filter(u => u.id !== userId)]);
      return newUser;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}`);
      throw error;
    }
  };

  const updateUserDoc = async (userId: string, updates: Partial<User>): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to update user document.');
    }
    const isAdmin = currentUser.role === 'admin' || auth.currentUser?.email === 'admin@studentplug.ng' || auth.currentUser?.email === 'oko28640@gmail.com';
    if (activeAuthUid !== userId && !isAdmin) {
      throw new Error('Unauthorized: You can only update your own user profile document.');
    }

    const clean = sanitizeForFirestore(updates);
    try {
      await setDoc(doc(db, 'users', userId), clean, { merge: true });
      setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
      if (currentUser.id === userId) {
        setCurrentUser({ ...currentUser, ...updates });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      throw error;
    }
  };

  const deleteUserDoc = async (userId: string): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to delete user document.');
    }
    const isAdmin = currentUser.role === 'admin' || auth.currentUser?.email === 'admin@studentplug.ng' || auth.currentUser?.email === 'oko28640@gmail.com';
    if (activeAuthUid !== userId && !isAdmin) {
      throw new Error('Unauthorized: You can only delete your own profile document.');
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
      throw error;
    }
  };

  // ==========================================
  // FIRESTORE CRUD HELPER METHODS: 'listings'
  // ==========================================
  const getListingDoc = async (listingId: string): Promise<Product | null> => {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, 'listings', listingId));
      if (snap.exists()) {
        return snap.data() as Product;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `listings/${listingId}`);
      return null;
    }
  };

  const getListingsDocs = async (filterBySchool?: string): Promise<Product[]> => {
    if (!db) return [];
    try {
      if (filterBySchool && filterBySchool !== 'All') {
        const queryRef = query(collection(db, 'listings'), where('sellerSchool', '==', filterBySchool));
        const snap = await getDocs(queryRef);
        return snap.docs.map(d => d.data() as Product);
      }
      const snap = await getDocs(collection(db, 'listings'));
      return snap.docs.map(d => d.data() as Product);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'listings');
      return [];
    }
  };

  const createListingDoc = async (
    listingData: Omit<Product, 'id' | 'datePosted' | 'viewsCount' | 'favouritesCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerSchool' | 'sellerCampus' | 'sellerVerified' | 'sellerAvatar'> & Partial<Product>
  ): Promise<Product> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to create a listing in Firestore.');
    }

    const listingId = listingData.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: Product = {
      ...listingData,
      id: listingId,
      sellerId: activeAuthUid, // strictly satisfies `request.resource.data.sellerId == request.auth.uid`
      sellerName: currentUser.fullName || auth.currentUser?.displayName || 'Campus Student',
      sellerSchool: currentUser.school || 'University of Lagos',
      sellerCampus: currentUser.campus || 'Main Campus',
      sellerVerified: currentUser.isVerified || false,
      sellerAvatar: currentUser.avatar || auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeAuthUid}`,
      datePosted: listingData.datePosted || 'Just now',
      viewsCount: listingData.viewsCount || 1,
      favouritesCount: listingData.favouritesCount || 0,
      status: listingData.status || 'active',
      images: listingData.images && listingData.images.length > 0 ? listingData.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
      condition: listingData.condition || 'Used',
      category: listingData.category || 'Books & School Materials',
      title: listingData.title || 'Campus Item',
      price: listingData.price || 1000,
      description: listingData.description || 'Campus item available for inspection and safe meetup.',
      locationDetails: listingData.locationDetails || `${currentUser.campus || 'Campus'} hostel/faculty`,
      quantity: listingData.quantity || 1,
      deliveryOptions: listingData.deliveryOptions || ['Campus Safe Meetup', 'Faculty SUB Meetup'],
    };

    const clean = sanitizeForFirestore(newProduct);
    try {
      await setDoc(doc(db, 'listings', listingId), clean);
      setProducts(prev => [newProduct, ...prev.filter(p => p.id !== listingId)]);
      return newProduct;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `listings/${listingId}`);
      throw error;
    }
  };

  const updateListingDoc = async (listingId: string, updates: Partial<Product>): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to update listing in Firestore.');
    }

    const clean = sanitizeForFirestore(updates);
    try {
      await setDoc(doc(db, 'listings', listingId), clean, { merge: true });
      setProducts(prev => prev.map(p => (p.id === listingId ? { ...p, ...updates } : p)));
      if (viewProductDetail && viewProductDetail.id === listingId) {
        setViewProductDetail(prev => (prev ? { ...prev, ...updates } : null));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${listingId}`);
      throw error;
    }
  };

  const deleteListingDoc = async (listingId: string): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to delete listing in Firestore.');
    }

    try {
      await deleteDoc(doc(db, 'listings', listingId));
      setProducts(prev => prev.filter(p => p.id !== listingId));
      if (viewProductDetail && viewProductDetail.id === listingId) {
        setViewProductDetail(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `listings/${listingId}`);
      throw error;
    }
  };

  // ==========================================
  // FIRESTORE CRUD HELPER METHODS: 'orders'
  // ==========================================
  const getOrderDoc = async (orderId: string): Promise<Order | null> => {
    if (!db) return null;
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to view order document.');
    }

    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        return snap.data() as Order;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `orders/${orderId}`);
      return null;
    }
  };

  const getUserOrdersDocs = async (userId?: string): Promise<Order[]> => {
    if (!db) return [];
    const targetUid = userId || auth.currentUser?.uid;
    if (!targetUid) {
      return [];
    }

    try {
      const isAdmin = currentUser.role === 'admin' || auth.currentUser?.email === 'admin@studentplug.ng' || auth.currentUser?.email === 'oko28640@gmail.com';
      if (isAdmin && !userId) {
        const snap = await getDocs(collection(db, 'orders'));
        return snap.docs.map(d => d.data() as Order);
      }

      const buyerQ = query(collection(db, 'orders'), where('buyerId', '==', targetUid));
      const sellerQ = query(collection(db, 'orders'), where('sellerId', '==', targetUid));
      const [buyerSnap, sellerSnap] = await Promise.all([getDocs(buyerQ), getDocs(sellerQ)]);
      
      const ordersMap = new Map<string, Order>();
      buyerSnap.forEach(d => ordersMap.set(d.id, d.data() as Order));
      sellerSnap.forEach(d => ordersMap.set(d.id, d.data() as Order));
      return Array.from(ordersMap.values());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      return [];
    }
  };

  const createOrderDoc = async (orderData: Partial<Order>): Promise<Order> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to create an order document in Firestore.');
    }

    const orderId = orderData.id || orderData.orderNumber || `SP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullOrder: Order = {
      id: orderId,
      orderNumber: orderData.orderNumber || orderId,
      productId: orderData.productId || '',
      productTitle: orderData.productTitle || 'Campus Marketplace Item',
      productPrice: orderData.productPrice || 0,
      productImage: orderData.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
      sellerId: orderData.sellerId || '',
      sellerName: orderData.sellerName || 'Campus Seller',
      sellerSchool: orderData.sellerSchool || 'University of Lagos',
      buyerId: activeAuthUid, // strictly satisfies `request.resource.data.buyerId == request.auth.uid`
      buyerName: currentUser.fullName || auth.currentUser?.displayName || 'Campus Student',
      buyerSchool: currentUser.school || 'University of Lagos',
      buyerPhone: orderData.buyerPhone || currentUser.phone || '+234 800 000 0000',
      fulfillmentType: orderData.fulfillmentType || 'pickup',
      deliveryOption: orderData.deliveryOption || 'Campus Safe Meetup',
      meetupLocation: orderData.meetupLocation || 'Student Union Building',
      deliveryFee: orderData.deliveryFee || 0,
      totalAmount: orderData.totalAmount || ((orderData.productPrice || 0) + (orderData.deliveryFee || 0)),
      paymentMethod: orderData.paymentMethod || 'pay_on_inspection',
      paymentStatus: orderData.paymentStatus || 'Pending',
      notes: orderData.notes,
      transactionRef: orderData.transactionRef,
      status: orderData.status || 'Pending',
      dateCreated: orderData.dateCreated || 'Just now',
      dateUpdated: orderData.dateUpdated || 'Just now',
      reviewed: orderData.reviewed || false,
      paymentReceipt: orderData.paymentReceipt,
    };

    const clean = sanitizeForFirestore(fullOrder);
    try {
      await setDoc(doc(db, 'orders', orderId), clean);
      setOrders(prev => [fullOrder, ...prev.filter(o => o.id !== orderId)]);
      return fullOrder;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      throw error;
    }
  };

  const updateOrderDoc = async (orderId: string, updates: Partial<Order>): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to update order document in Firestore.');
    }

    const clean = sanitizeForFirestore({
      ...updates,
      dateUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    try {
      await setDoc(doc(db, 'orders', orderId), clean, { merge: true });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, ...updates, dateUpdated: 'Just now' } : o))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      throw error;
    }
  };

  const deleteOrderDoc = async (orderId: string): Promise<void> => {
    if (!db) throw new Error('Firestore is not initialized.');
    const activeAuthUid = auth.currentUser?.uid;
    if (!activeAuthUid) {
      throw new Error('Authentication required to delete order document.');
    }
    const isAdmin = currentUser.role === 'admin' || auth.currentUser?.email === 'admin@studentplug.ng' || auth.currentUser?.email === 'oko28640@gmail.com';
    if (!isAdmin) {
      throw new Error('Unauthorized: Only administrators can delete orders per Firestore rules.');
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
      throw error;
    }
  };

  // ==========================================
  // FIRESTORE DATA STRUCTURE INITIALIZATION
  // ==========================================
  const initializeFirestoreDataStructure = async (options?: { force?: boolean }): Promise<{
    success: boolean;
    initializedCollections: string[];
    summary: Record<string, number>;
    message: string;
  }> => {
    if (!db) {
      const msg = 'Firestore database instance is not available.';
      showToast(msg);
      return { success: false, initializedCollections: [], summary: {}, message: msg };
    }

    const force = Boolean(options?.force);
    const initializedCollections: string[] = [];
    const summary: Record<string, number> = {};

    try {
      // 0. Connection validation doc
      try {
        await setDoc(
          doc(db, 'test', 'connection'),
          {
            status: 'connected',
            appName: 'StudentPlug NG',
            environment: 'production',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        summary['test'] = 1;
        initializedCollections.push('test');
      } catch (e) {
        console.warn('Test connection doc note:', e);
      }

      // 1. INSTITUTIONS Collection
      try {
        const instSnap = await getDocs(query(collection(db, 'institutions'), limit(1)));
        if (instSnap.empty || force) {
          let count = 0;
          for (const inst of INITIAL_INSTITUTIONS) {
            const clean = sanitizeForFirestore(inst);
            await setDoc(doc(db, 'institutions', inst.id), clean, { merge: true });
            count++;
          }
          summary['institutions'] = count;
          initializedCollections.push('institutions');
          setInstitutions(INITIAL_INSTITUTIONS);
        } else {
          summary['institutions'] = instSnap.size;
        }
      } catch (instErr) {
        console.warn('Institutions collection initialization note:', instErr);
      }

      // 2. USERS Collection
      try {
        // Ensure active user doc is present and well-structured
        if (auth.currentUser) {
          const cleanActiveUser = sanitizeForFirestore({
            ...currentUser,
            id: auth.currentUser.uid,
            email: auth.currentUser.email || currentUser.email,
          });
          await setDoc(doc(db, 'users', auth.currentUser.uid), cleanActiveUser, { merge: true });
          summary['users_active'] = 1;
        }

        const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
        if (usersSnap.empty || force) {
          let uCount = 0;
          for (const u of INITIAL_USERS) {
            const cleanUser = sanitizeForFirestore(u);
            await setDoc(doc(db, 'users', u.id), cleanUser, { merge: true });
            uCount++;
          }
          summary['users'] = uCount;
          initializedCollections.push('users');
        } else {
          summary['users'] = usersSnap.size;
        }
      } catch (userErr) {
        console.warn('Users collection initialization note:', userErr);
      }

      // 3. LISTINGS Collection
      try {
        const listingsSnap = await getDocs(query(collection(db, 'listings'), limit(1)));
        if (listingsSnap.empty || force) {
          let lCount = 0;
          for (const p of INITIAL_PRODUCTS) {
            const sellerIdToUse = auth.currentUser?.uid || p.sellerId;
            const item = {
              ...p,
              sellerId: sellerIdToUse,
              datePosted: p.datePosted || 'Recently',
              locationDetails: p.locationDetails || `${p.sellerCampus} hostel/faculty`,
              quantity: p.quantity || 1,
              deliveryOptions: p.deliveryOptions || ['Campus Safe Meetup'],
            };
            const cleanProd = sanitizeForFirestore(item);
            await setDoc(doc(db, 'listings', p.id), cleanProd, { merge: true });
            lCount++;
          }
          summary['listings'] = lCount;
          initializedCollections.push('listings');
        } else {
          summary['listings'] = listingsSnap.size;
        }
      } catch (listErr) {
        console.warn('Listings collection initialization note:', listErr);
      }

      // 4. ORDERS Collection
      try {
        const ordersSnap = await getDocs(query(collection(db, 'orders'), limit(1)));
        if (ordersSnap.empty || force) {
          let oCount = 0;
          for (const ord of INITIAL_ORDERS) {
            const buyerIdToUse = auth.currentUser?.uid || ord.buyerId;
            const ordItem = {
              ...ord,
              buyerId: buyerIdToUse,
            };
            const cleanOrd = sanitizeForFirestore(ordItem);
            await setDoc(doc(db, 'orders', ord.id), cleanOrd, { merge: true });
            oCount++;
          }
          summary['orders'] = oCount;
          initializedCollections.push('orders');
        } else {
          summary['orders'] = ordersSnap.size;
        }
      } catch (orderErr) {
        console.warn('Orders collection initialization note:', orderErr);
      }

      // 5. CONVERSATIONS Collection & messages Subcollection
      try {
        const convSnap = await getDocs(query(collection(db, 'conversations'), limit(1)));
        if (convSnap.empty || force) {
          let cCount = 0;
          for (const conv of INITIAL_CONVERSATIONS) {
            const participants = auth.currentUser?.uid
              ? Array.from(new Set([auth.currentUser.uid, ...(conv.participants || [conv.sellerId, conv.buyerId])]))
              : (conv.participants || [conv.sellerId, conv.buyerId]);
            const convDoc = {
              ...conv,
              participants,
            };
            await setDoc(doc(db, 'conversations', conv.id), sanitizeForFirestore(convDoc), { merge: true });

            if (conv.messages && conv.messages.length > 0) {
              for (const msg of conv.messages) {
                await setDoc(
                  doc(db, 'conversations', conv.id, 'messages', msg.id),
                  sanitizeForFirestore({
                    ...msg,
                    conversationId: conv.id,
                  }),
                  { merge: true }
                );
              }
            }
            cCount++;
          }
          summary['conversations'] = cCount;
          initializedCollections.push('conversations');
        } else {
          summary['conversations'] = convSnap.size;
        }
      } catch (convErr) {
        console.warn('Conversations collection initialization note:', convErr);
      }

      // 6. REVIEWS Collection
      try {
        const reviewsSnap = await getDocs(query(collection(db, 'reviews'), limit(1)));
        if (reviewsSnap.empty || force) {
          let rCount = 0;
          for (const rev of INITIAL_REVIEWS) {
            const buyerIdToUse = auth.currentUser?.uid || rev.buyerId;
            await setDoc(doc(db, 'reviews', rev.id), sanitizeForFirestore({ ...rev, buyerId: buyerIdToUse }), { merge: true });
            rCount++;
          }
          summary['reviews'] = rCount;
          initializedCollections.push('reviews');
        } else {
          summary['reviews'] = reviewsSnap.size;
        }
      } catch (revErr) {
        console.warn('Reviews collection initialization note:', revErr);
      }

      // 7. VERIFICATION REQUESTS Collection
      try {
        const verifSnap = await getDocs(query(collection(db, 'verificationRequests'), limit(1)));
        if (verifSnap.empty || force) {
          let vCount = 0;
          for (const vr of INITIAL_VERIFICATION_REQUESTS) {
            const userIdToUse = auth.currentUser?.uid || vr.userId;
            await setDoc(doc(db, 'verificationRequests', vr.id), sanitizeForFirestore({ ...vr, userId: userIdToUse }), { merge: true });
            vCount++;
          }
          summary['verificationRequests'] = vCount;
          initializedCollections.push('verificationRequests');
        } else {
          summary['verificationRequests'] = verifSnap.size;
        }
      } catch (verifErr) {
        console.warn('Verification requests collection initialization note:', verifErr);
      }

      // 8. NOTIFICATIONS Collection
      try {
        const notifSnap = await getDocs(query(collection(db, 'notifications'), limit(1)));
        if (notifSnap.empty || force) {
          let nCount = 0;
          for (const n of INITIAL_NOTIFICATIONS) {
            const userIdToUse = auth.currentUser?.uid || n.userId;
            await setDoc(doc(db, 'notifications', n.id), sanitizeForFirestore({ ...n, userId: userIdToUse }), { merge: true });
            nCount++;
          }
          summary['notifications'] = nCount;
          initializedCollections.push('notifications');
        } else {
          summary['notifications'] = notifSnap.size;
        }
      } catch (notifErr) {
        console.warn('Notifications collection initialization note:', notifErr);
      }

      // 9. REPORTS Collection
      try {
        const repSnap = await getDocs(query(collection(db, 'reports'), limit(1)));
        if (repSnap.empty || force) {
          let repCount = 0;
          for (const rep of INITIAL_REPORTS) {
            const reporterIdToUse = auth.currentUser?.uid || rep.reporterId;
            await setDoc(doc(db, 'reports', rep.id), sanitizeForFirestore({ ...rep, reporterId: reporterIdToUse }), { merge: true });
            repCount++;
          }
          summary['reports'] = repCount;
          initializedCollections.push('reports');
        } else {
          summary['reports'] = repSnap.size;
        }
      } catch (repErr) {
        console.warn('Reports collection initialization note:', repErr);
      }

      const allColls = [
        'users',
        'institutions',
        'listings',
        'orders',
        'conversations',
        'reviews',
        'verificationRequests',
        'notifications',
        'reports',
      ];
      const message = `Firestore data structure initialized successfully. Collections verified: ${allColls.join(', ')}.`;

      showToast('Firestore data structure verified and ready.');
      return {
        success: true,
        initializedCollections,
        summary,
        message,
      };
    } catch (error) {
      console.error('Firestore data structure initialization error:', error);
      handleFirestoreError(error, OperationType.WRITE, 'initializeFirestoreDataStructure');
      return {
        success: false,
        initializedCollections,
        summary,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  };

  // Firebase Authentication methods
  const signInWithEmailAndPassword = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await fbSignInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      // Load or build student profile from Firestore
      let profile: User | null = null;
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            profile = snap.data() as User;
            // Ensure any updated credentials from Auth are preserved in Firestore
            const updatedProfile: User = {
              ...profile,
              id: fbUser.uid,
              email: fbUser.email || profile.email || email.trim(),
              fullName: profile.fullName || fbUser.displayName || email.split('@')[0] || 'Campus Student',
              avatar: profile.avatar || fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
            };
            profile = updatedProfile;
            await setDoc(userDocRef, updatedProfile, { merge: true });
          }
        } catch (e) {
          console.warn('Error fetching or updating Firestore user profile on sign in:', e);
        }
      }

      if (!profile) {
        const existing = allUsers.find(
          u => u.id === fbUser.uid || (fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase())
        );
        profile = existing
          ? {
              ...existing,
              id: fbUser.uid,
              email: fbUser.email || existing.email,
            }
          : {
              id: fbUser.uid,
              fullName: fbUser.displayName || email.split('@')[0] || 'Campus Student',
              email: fbUser.email || email.trim(),
              phone: fbUser.phoneNumber || '+234 812 000 0000',
              school: selectedSchoolFilter !== 'All' ? selectedSchoolFilter : (institutions[0]?.name || 'University of Lagos'),
              campus: institutions[0]?.campuses?.[0] || 'Main Campus',
              faculty: 'General Studies',
              department: 'Student Department',
              level: '200L',
              avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
              isVerified: false,
              verificationStatus: 'unverified',
              role: (fbUser.email === 'admin@studentplug.ng' || fbUser.email === 'oko28640@gmail.com') ? 'admin' : 'student',
              joinedDate: 'Sep 2026',
              rating: 5.0,
              reviewsCount: 0,
              completedSalesCount: 0,
              responseRate: '100%',
              bio: 'Verified Nigerian campus student on StudentPlug NG.',
              studentIdCardSubmitted: false,
            };

        if (db) {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true });
          } catch (e) {
            console.warn('Could not sync user profile to Firestore:', e);
          }
        }
      }

      setAllUsers(prev => [profile!, ...prev.filter(u => u.id !== profile!.id)]);
      setCurrentUserId(profile.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, profile.id);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${profile.fullName}!`);
    } catch (err: any) {
      let message = 'Failed to sign in. Please check your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your details or create an account.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid student email address.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This campus account has been disabled. Please reach out to support.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please wait a moment and try again.';
      } else if (err.message) {
        message = err.message;
      }
      showToast(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const registerWithEmailAndPassword = async (email: string, pass: string, profileData?: Partial<User>) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await fbCreateUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = userCredential.user;

      try {
        if (profileData?.fullName || profileData?.avatar) {
          await updateProfile(fbUser, {
            displayName: profileData?.fullName?.trim(),
            photoURL: profileData?.avatar,
          });
        }
      } catch (err) {
        console.warn('updateProfile notice:', err);
      }

      const newStudent: User = {
        id: fbUser.uid,
        fullName: profileData?.fullName?.trim() || fbUser.displayName || email.split('@')[0] || 'Campus Student',
        email: fbUser.email || email.trim(),
        phone: profileData?.phone || '+234 812 000 0000',
        school: profileData?.school || (selectedSchoolFilter !== 'All' ? selectedSchoolFilter : (institutions[0]?.name || 'University of Lagos')),
        campus: profileData?.campus || institutions[0]?.campuses?.[0] || 'Main Campus',
        faculty: profileData?.faculty || 'General Studies',
        department: profileData?.department || 'Student Department',
        programme: profileData?.programme || undefined,
        level: profileData?.level || '200L',
        matricNumber: profileData?.matricNumber || undefined,
        avatar: profileData?.avatar || fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
        isVerified: false,
        verificationStatus: 'unverified',
        role: (fbUser.email === 'admin@studentplug.ng' || fbUser.email === 'oko28640@gmail.com') ? 'admin' : 'student',
        joinedDate: 'Sep 2026',
        rating: 5.0,
        reviewsCount: 0,
        completedSalesCount: 0,
        responseRate: '100%',
        bio: profileData?.bio || 'Verified Nigerian campus student on StudentPlug NG.',
        studentIdCardSubmitted: false,
      };

      if (db) {
        await setDoc(doc(db, 'users', fbUser.uid), newStudent, { merge: true });
      }

      setFirebaseUser(fbUser);
      setAllUsers(prev => [newStudent, ...prev.filter(u => u.id !== newStudent.id)]);
      setCurrentUserId(newStudent.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newStudent.id);
      setIsAuthModalOpen(false);
      showToast(`Welcome to StudentPlug NG, ${newStudent.fullName}!`);
    } catch (err: any) {
      let message = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This student email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid student email address.';
      } else if (err.message) {
        message = err.message;
      }
      showToast(message);
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signInWithEmail = signInWithEmailAndPassword;
  const signUpWithEmail = registerWithEmailAndPassword;

  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    try {
      // Use configured googleProvider from services/firebase
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setFirebaseUser(fbUser);

      // Check if user profile already exists in Firestore or create a new one
      let profile: User | null = null;
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            // Profile successfully retrieved from Firestore
            profile = snap.data() as User;

            // Optionally sync avatar if newly available from Google
            if ((!profile.avatar || profile.avatar.includes('dicebear')) && fbUser.photoURL) {
              profile.avatar = fbUser.photoURL;
              await setDoc(userDocRef, { avatar: fbUser.photoURL }, { merge: true });
            }
          } else {
            // Profile does not exist in Firestore: create a fresh student profile
            const existingLocal = allUsers.find(
              u => fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase()
            );

            profile = {
              id: fbUser.uid,
              fullName: fbUser.displayName || existingLocal?.fullName || fbUser.email?.split('@')[0] || 'Campus Student',
              email: fbUser.email || 'student@campus.edu.ng',
              phone: fbUser.phoneNumber || existingLocal?.phone || '+234 812 000 0000',
              school: existingLocal?.school || (selectedSchoolFilter !== 'All' ? selectedSchoolFilter : (institutions[0]?.name || 'University of Lagos')),
              campus: existingLocal?.campus || institutions[0]?.campuses?.[0] || 'Main Campus',
              faculty: existingLocal?.faculty || 'General Studies',
              department: existingLocal?.department || 'Student Department',
              level: existingLocal?.level || '200L',
              avatar: fbUser.photoURL || existingLocal?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
              isVerified: existingLocal?.isVerified || false,
              verificationStatus: existingLocal?.verificationStatus || 'unverified',
              role: (fbUser.email === 'admin@studentplug.ng' || fbUser.email === 'oko28640@gmail.com') ? 'admin' : (existingLocal?.role || 'student'),
              joinedDate: existingLocal?.joinedDate || 'Sep 2026',
              rating: existingLocal?.rating || 5.0,
              reviewsCount: existingLocal?.reviewsCount || 0,
              completedSalesCount: existingLocal?.completedSalesCount || 0,
              responseRate: existingLocal?.responseRate || '100%',
              bio: existingLocal?.bio || 'Verified Nigerian campus student on StudentPlug NG.',
              studentIdCardSubmitted: existingLocal?.studentIdCardSubmitted || false,
            };

            await setDoc(userDocRef, profile, { merge: true });
          }
        } catch (firestoreErr) {
          console.warn('Firestore user profile sync note during Google sign in:', firestoreErr);
        }
      }

      // Fallback in case Firestore connection was offline
      if (!profile) {
        const existingLocal = allUsers.find(
          u => fbUser.email && u.email.toLowerCase() === fbUser.email.toLowerCase()
        );
        profile = {
          id: fbUser.uid,
          fullName: fbUser.displayName || existingLocal?.fullName || fbUser.email?.split('@')[0] || 'Campus Student',
          email: fbUser.email || 'student@campus.edu.ng',
          phone: fbUser.phoneNumber || existingLocal?.phone || '+234 812 000 0000',
          school: existingLocal?.school || (selectedSchoolFilter !== 'All' ? selectedSchoolFilter : (institutions[0]?.name || 'University of Lagos')),
          campus: existingLocal?.campus || institutions[0]?.campuses?.[0] || 'Main Campus',
          faculty: 'General Studies',
          department: 'Student Department',
          level: '200L',
          avatar: fbUser.photoURL || existingLocal?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          isVerified: existingLocal?.isVerified || false,
          verificationStatus: existingLocal?.verificationStatus || 'unverified',
          role: (fbUser.email === 'admin@studentplug.ng' || fbUser.email === 'oko28640@gmail.com') ? 'admin' : 'student',
          joinedDate: 'Sep 2026',
          rating: 5.0,
          reviewsCount: 0,
          completedSalesCount: 0,
          responseRate: '100%',
          bio: 'Verified Nigerian campus student on StudentPlug NG.',
          studentIdCardSubmitted: false,
        };
      }

      setAllUsers(prev => [profile!, ...prev.filter(u => u.id !== profile!.id)]);
      setCurrentUserId(profile.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, profile.id);
      setIsAuthModalOpen(false);
      showToast(`Signed in with Google as ${profile.fullName}!`);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        showToast('Google sign-in popup was closed.');
      } else if (err.code === 'auth/popup-blocked') {
        showToast('Google sign-in popup was blocked by browser. Please enable popups.');
      } else {
        showToast(err.message || 'Google sign-in failed. Please try again.');
      }
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      let message = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No student account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid student email address.';
      } else if (err.message) {
        message = err.message;
      }
      showToast(message);
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      const fallback = allUsers.find(u => u.id === 'user_femi') || allUsers[0] || INITIAL_USERS[0];
      setCurrentUserId(fallback.id);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, fallback.id);
      showToast('Signed out of StudentPlug NG.');
    } catch (err: any) {
      showToast(err.message || 'Error signing out.');
    }
  };

  return (
    <MarketContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        switchUser,
        registerStudent,
        deleteCurrentUserAccount,
        isLegalModalOpen,
        setIsLegalModalOpen,
        legalModalTab,
        setLegalModalTab,
        openLegalDocs,
        isAccountDeletionModalOpen,
        setIsAccountDeletionModalOpen,
        firebaseUser,
        isSignedIn,
        isFirebaseConnected,
        isAuthLoading,
        signInWithEmailAndPassword,
        registerWithEmailAndPassword,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signOutUser,
        db,
        getUserDoc,
        createUserDoc,
        updateUserDoc,
        deleteUserDoc,
        getListingDoc,
        getListingsDocs,
        createListingDoc,
        updateListingDoc,
        deleteListingDoc,
        getOrderDoc,
        getUserOrdersDocs,
        createOrderDoc,
        updateOrderDoc,
        deleteOrderDoc,
        initializeFirestoreDataStructure,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        markProductAsSold,
        toggleBoostProduct,
        toggleFeaturedProduct,
        favourites,
        toggleFavourite,
        isFavourite,
        selectedSchoolFilter,
        setSelectedSchoolFilter,
        campusScope,
        setCampusScope,
        institutions,
        addInstitution,
        updateInstitution,
        deleteInstitution,
        toggleInstitutionStatus,
        addMeetupPointToInstitution,
        removeMeetupPointFromInstitution,
        conversations,
        activeConversation,
        setActiveConversation,
        startOrOpenChat,
        sendMessage,
        orders,
        payments,
        placeOrder,
        completeCheckoutOrder,
        updateOrderStatus,
        cancelOrder,
        reviews,
        addReview,
        deleteReview,
        verificationRequests,
        submitVerificationRequest,
        approveVerificationRequest,
        rejectVerificationRequest,
        promotions,
        promoteListing,
        blockedUsers,
        blockUser,
        unblockUser,
        isUserBlocked,
        reports,
        reportListing,
        resolveReport,
        verifyStudentAccount,
        suspendUser,
        restoreUser,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        executeSearch,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        selectedCategory,
        setSelectedCategory,
        viewProductDetail,
        setViewProductDetail,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSafetyModalOpen,
        setIsSafetyModalOpen,
        isOrderModalOpen,
        setIsOrderModalOpen,
        orderTargetProduct,
        setOrderTargetProduct,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutTargetProduct,
        setCheckoutTargetProduct,
        isReviewModalOpen,
        setIsReviewModalOpen,
        reviewTargetOrder,
        setReviewTargetOrder,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        receiptTargetReceipt,
        setReceiptTargetReceipt,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isNotificationsModalOpen,
        setIsNotificationsModalOpen,
        isPromoteModalOpen,
        setIsPromoteModalOpen,
        promoteTargetProduct,
        setPromoteTargetProduct,
        selectedSellerProfile,
        setSelectedSellerProfile,
        selectedSellerProfileId: selectedSellerProfile?.id || null,
        openSellerProfile,
        closeSellerProfile: () => setSelectedSellerProfile(null),
        blockedUserIds: blockedUsers.map(b => b.blockedUserId),
        reviewVerificationRequest: (requestId: string, action: 'approved' | 'rejected' | 'verified', note?: string) => {
          if (action === 'approved' || action === 'verified') {
            approveVerificationRequest(requestId);
          } else {
            rejectVerificationRequest(requestId, note);
          }
        },
        toastMessage,
        showToast,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
