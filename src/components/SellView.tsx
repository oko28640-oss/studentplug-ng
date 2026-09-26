import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  Building2, 
  Zap, 
  ShieldCheck, 
  Info,
  Wrench,
  Package,
  Tag,
  Clock,
  MapPin
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { ProductCategory, ProductCondition } from '../types';
import { CATEGORIES_DATA, SERVICES_CATEGORIES_DATA } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';

const SAMPLE_PHOTO_PRESETS = [
  { name: 'Hostel Appliance', url: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80' },
  { name: 'Laptop / Gadget', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' },
  { name: 'Smartphone', url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Campus Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hair / Service', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fashion & Shoes', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
];

export const SellView: React.FC = () => {
  const { currentUser, addProduct, setActiveTab, setViewProductDetail, promoteListing, institutions } = useMarket();

  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Hostel Items');
  const [price, setPrice] = useState('');
  const [isDeal, setIsDeal] = useState(false);
  const [discountPrice, setDiscountPrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('Same Day / 24 Hours');
  const [condition, setCondition] = useState<ProductCondition>('Used');
  const [description, setDescription] = useState('');
  const [locationDetails, setLocationDetails] = useState(currentUser.campus || 'Main Campus');
  const [quantity, setQuantity] = useState('1');
  const [images, setImages] = useState<string[]>([SAMPLE_PHOTO_PRESETS[0].url]);
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([
    'Meet at SUB',
    'Hostel Delivery',
    'Faculty Meetup'
  ]);
  const [isPromoted, setIsPromoted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Institution faculties and safe meetups from active institutions database
  const schoolData = institutions.find(i => i.name === currentUser.school) || institutions[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 5 - images.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    for (const file of filesToProcess) {
      try {
        const compressed = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.82
        });
        setImages(prev => prev.length < 5 ? [...prev, compressed.dataUrl] : prev);
      } catch (err) {
        // Fallback to raw FileReader if canvas compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages(prev => prev.length < 5 ? [...prev, reader.result as string] : prev);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addPresetImage = (url: string) => {
    if (images.length < 5) {
      setImages(prev => [...prev, url]);
    }
  };

  const toggleDeliveryOption = (option: string) => {
    if (deliveryOptions.includes(option)) {
      if (deliveryOptions.length > 1) {
        setDeliveryOptions(prev => prev.filter(o => o !== option));
      }
    } else {
      setDeliveryOptions(prev => [...prev, option]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg(itemType === 'service' ? 'Please enter a service name.' : 'Please enter a product title.');
      return;
    }

    const parsedPrice = parseFloat(price.replace(/,/g, ''));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg('Please enter a valid price in Nigerian Naira (₦).');
      return;
    }

    let parsedDiscount: number | undefined;
    if (isDeal && discountPrice) {
      parsedDiscount = parseFloat(discountPrice.replace(/,/g, ''));
      if (isNaN(parsedDiscount) || parsedDiscount >= parsedPrice) {
        setErrorMsg('Deal discount price must be lower than original price.');
        return;
      }
    }

    if (!description.trim()) {
      setErrorMsg('Please provide a short description for your fellow students.');
      return;
    }

    if (images.length === 0) {
      setErrorMsg('Please upload or select at least 1 photo.');
      return;
    }

    const createdProduct = addProduct({
      title: title.trim(),
      category: category as ProductCategory,
      price: parsedPrice,
      condition,
      description: description.trim(),
      images,
      locationDetails: locationDetails.trim() || `${currentUser.school}`,
      quantity: parseInt(quantity, 10) || 1,
      deliveryOptions,
      isFeatured: isPromoted,
      isPromoted,
      itemType,
      isDeal,
      discountPrice: parsedDiscount,
      serviceDuration: itemType === 'service' ? serviceDuration : undefined,
    });

    if (isPromoted) {
      promoteListing(createdProduct.id, '3d', 1200, `PSTK_NEW_${Date.now()}`);
    }

    setViewProductDetail(createdProduct);
    setActiveTab('home');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>Listing on {currentUser.school}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Post Listing or Student Service
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
          Connect directly with thousands of verified students across hostels, departments, and campus gates.
        </p>
      </div>

      {/* Item Type Selector: Product vs Service */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setItemType('product');
            setCategory('Hostel Items');
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            itemType === 'product'
              ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          <span>Physical Product (Fan, Phone, Cloth, Book)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setItemType('service');
            setCategory('Hairdressing & Braiding');
            setImages([SAMPLE_PHOTO_PRESETS[4].url]);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            itemType === 'service'
              ? 'bg-white text-indigo-950 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-indigo-600" />
          <span>Student Service (Hair, Repair, Tutoring, Laundry)</span>
        </button>
      </div>

      {/* Main Listing Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Title / Service Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block">
            {itemType === 'service' ? 'Service Name / Skill Offer' : 'Item Title'}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={itemType === 'service' 
              ? 'e.g. Knotless Braids & Wig Revamping at New Hall' 
              : 'e.g. 12kg Gas Cylinder with Regulator & Hose'}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-emerald-600 text-slate-900"
          />
        </div>

        {/* Category & Condition/Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-emerald-600 text-slate-900"
            >
              {itemType === 'product' ? (
                CATEGORIES_DATA.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))
              ) : (
                SERVICES_CATEGORIES_DATA.map((srv) => (
                  <option key={srv.name} value={srv.name}>{srv.name}</option>
                ))
              )}
            </select>
          </div>

          {itemType === 'product' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-emerald-600 text-slate-900"
              >
                <option value="New">Brand New</option>
                <option value="Like New">Like New / Barely Used</option>
                <option value="Used">Used / Good Condition</option>
                <option value="Fair">Fair / Functional</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 block">Turnaround Time</label>
              <select
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-emerald-600 text-slate-900"
              >
                <option value="Instant / While You Wait">Instant / While You Wait</option>
                <option value="Same Day / 24 Hours">Same Day / 24 Hours</option>
                <option value="2 to 3 Days">2 to 3 Days</option>
                <option value="Flexible / By Appointment">Flexible / By Appointment</option>
              </select>
            </div>
          )}
        </div>

        {/* Pricing & Deals */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">
                {itemType === 'service' ? 'Service Fee (₦)' : 'Price (₦)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">₦</span>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full text-xs sm:text-sm pl-8 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-900"
                />
              </div>
            </div>

            {itemType === 'product' && (
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDeal}
                    onChange={(e) => setIsDeal(e.target.checked)}
                    className="text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-red-500" />
                    Offer as Student Deal / Discount
                  </span>
                </label>
              </div>
            )}
          </div>

          {isDeal && itemType === 'product' && (
            <div className="pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-red-700 block mb-1">
                Discounted Deal Price (₦)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-red-700 text-xs">₦</span>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full text-xs pl-8 pr-3.5 py-2 bg-white border border-red-200 rounded-xl focus:outline-red-600 text-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                This item will be highlighted in the "Student Deals" homepage section!
              </span>
            </div>
          )}
        </div>

        {/* Photos & Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900">
              Photos / Work Samples (Max 5)
            </label>
            <span className="text-[11px] text-slate-500">{images.length}/5 uploaded</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-18 h-18 rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="w-18 h-18 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 cursor-pointer bg-slate-50 transition">
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Quick Preset photos */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 block mb-1">Quick Sample Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PHOTO_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addPresetImage(p.url)}
                  disabled={images.length >= 5}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg transition disabled:opacity-40 cursor-pointer"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block">Description & Specs</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={itemType === 'service'
              ? "Describe your service, what clients should bring, operating hours, and location on campus..."
              : "Describe item condition, years used, why you are selling, included cables or accessories..."}
            className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-emerald-600 resize-none text-slate-900"
          />
        </div>

        {/* Campus Location / Hostel Spot */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Location / Hostel / Department</span>
          </label>
          <input
            type="text"
            required
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            placeholder="e.g. Jaja Hall / Moremi Hall / Faculty of Science"
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-emerald-600 text-slate-900"
          />
        </div>

        {/* Delivery / Meetup Preferences */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 block">
            Fulfillment & Safe Meetup Preferences
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Meet at SUB',
              'Hostel Delivery',
              'Faculty Meetup',
              'Campus Gate Meetup',
              'Library / Quiet Zone',
              'Online / WhatsApp File'
            ].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleDeliveryOption(opt)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                  deliveryOptions.includes(opt)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{opt}</span>
                {deliveryOptions.includes(opt) && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Promotion / Boost Checkbox */}
        <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPromoted}
              onChange={(e) => setIsPromoted(e.target.checked)}
              className="mt-0.5 text-amber-600 rounded-sm focus:ring-amber-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                Spotlight Boost with Paystack (Featured for 3 Days)
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Pin your listing to the top of your campus feed for ₦1,200 to get instant student inquiries.
              </p>
            </div>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Publish to Campus Marketplace</span>
        </button>
      </form>
    </div>
  );
};
