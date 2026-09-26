export type StudentLevel = 
  | '100L' 
  | '200L' 
  | '300L' 
  | '400L' 
  | '500L' 
  | '600L' 
  | 'ND I'
  | 'ND II'
  | 'HND I'
  | 'HND II'
  | 'ND1' 
  | 'ND2' 
  | 'HND1' 
  | 'HND2' 
  | 'NCE I'
  | 'NCE II'
  | 'NCE III'
  | 'Year 1'
  | 'Year 2'
  | 'Year 3'
  | 'Year 4'
  | 'Postgraduate' 
  | 'Alumni';

export type UserRole = 'student' | 'admin';

export type VerificationState = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  campus: string;
  faculty?: string;
  department: string;
  programme?: string;
  level: StudentLevel;
  matricNumber?: string; // PRIVATE: never exposed publicly
  avatar: string;
  isVerified: boolean;
  verificationStatus: VerificationState;
  role: UserRole;
  joinedDate: string;
  rating: number;
  reviewsCount: number;
  completedSalesCount: number;
  responseRate: string; // e.g. "98% (Replies within 15 mins)"
  bio?: string;
  studentIdCardSubmitted?: boolean;
  isSuspended?: boolean;
}

export type ProductCategory = 
  | 'Fashion & Clothing'
  | 'Shoes & Bags'
  | 'Beauty & Skincare'
  | 'Perfumes'
  | 'Food & Snacks'
  | 'Electronics'
  | 'Phones & Accessories'
  | 'Books & School Materials'
  | 'Hostel Items'
  | 'Hair & Wigs'
  | 'Services'
  | 'Second-hand Items'
  | 'Other';

export type ServiceCategory = 
  | 'Hair styling'
  | 'Barbing'
  | 'Makeup'
  | 'Photography'
  | 'Graphic design'
  | 'Catering'
  | 'Laundry'
  | 'Tutoring'
  | 'Printing'
  | 'Phone repair'
  | 'Fashion design'
  | 'Event decoration'
  | 'Delivery/dispatch';

export type ProductCondition = 'New' | 'Used';

export type ProductStatus = 'active' | 'sold' | 'reported' | 'removed';

export type ItemType = 'product' | 'service';

export interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  isDeal?: boolean;
  itemType?: ItemType;
  serviceCategory?: ServiceCategory;
  serviceDuration?: string;
  serviceAvailability?: string; // e.g. "Daily 9am-7pm, Hostel visits available"
  category: ProductCategory;
  condition: ProductCondition;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerSchool: string;
  sellerCampus: string;
  sellerVerified: boolean;
  sellerAvatar: string;
  locationDetails: string; // e.g. "Moremi Hall, UNILAG Main Campus"
  quantity: number;
  deliveryOptions: string[]; // e.g. ["Hostel Delivery", "Meet at Faculty / SUB", "Campus Gate Pickup"]
  isFeatured?: boolean;
  isPromoted?: boolean;
  promotedDuration?: '24h' | '3d' | '7d';
  promotedUntil?: string;
  status: ProductStatus;
  datePosted: string;
  viewsCount: number;
  favouritesCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  lastMessage: string;
  lastUpdated: string;
  unreadCountForUser: Record<string, number>;
  messages: ChatMessage[];
  participants?: string[];
  participantNames?: Record<string, string>;
  participantAvatars?: Record<string, string>;
  lastMessageTime?: string;
}

export type OrderStatus = 
  | 'Pending' 
  | 'Payment Processing' 
  | 'Paid' 
  | 'Seller Confirmed' 
  | 'Ready for Pickup' 
  | 'Out for Delivery' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Refunded'
  | 'Placed'
  | 'Confirmed'
  | 'Shipped'
  | 'Ready';

export type PaymentMethod = 'paystack' | 'flutterwave' | 'pay_on_inspection';

export type PaymentStatus = 'Pending' | 'Processing' | 'Successful' | 'Failed' | 'Refunded';

export interface PaymentReceipt {
  receiptNumber: string;
  orderNumber: string;
  transactionRef: string;
  productTitle: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  subtotal: number;
  deliveryFee: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string;
}

export interface Order {
  id: string; // Internal ID or order number (e.g. SP-2026-000001)
  orderNumber: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  sellerId: string;
  sellerName: string;
  sellerSchool: string;
  buyerId: string;
  buyerName: string;
  buyerSchool: string;
  buyerPhone: string;
  fulfillmentType: 'pickup' | 'delivery';
  deliveryOption: string; // e.g. "Campus Meetup", "Hostel Room Delivery"
  meetupLocation: string;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionRef?: string;
  paymentReceipt?: PaymentReceipt;
  notes?: string;
  status: OrderStatus;
  dateCreated: string;
  dateUpdated: string;
  reviewed?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerSchool: string;
  rating: number; // 1 - 5
  comment: string;
  productComment?: string;
  createdAt: string;
  isFlagged?: boolean;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  productTitle: string;
  userId: string;
  userName: string;
  amount: number;
  deliveryFee: number;
  totalAmount: number;
  currency: 'NGN';
  provider: 'paystack' | 'flutterwave' | 'cash';
  status: PaymentStatus;
  reference: string;
  channel: string; // 'card' | 'bank_transfer' | 'ussd' | 'cash'
  createdAt: string;
  paidAt?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  studentName: string;
  fullName?: string;
  email: string;
  school: string;
  faculty: string;
  department: string;
  level: StudentLevel;
  matricNumber: string; // private, visible only in admin dashboard
  idCardImage?: string;
  submittedAt: string;
  submittedDate?: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNote?: string;
}

export interface Promotion {
  id: string;
  productId?: string;
  listingId?: string;
  productTitle?: string;
  sellerId: string;
  duration: '24h' | '3d' | '7d';
  fee: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  expiresAt?: string;
  paymentStatus?: string;
  status: 'active' | 'expired';
  transactionRef: string;
}

export interface MeetupPoint {
  id: string;
  name: string;
  campus: string;
  school: string;
  landmark: string;
  isApproved: boolean;
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedUserName: string;
  blockedAt: string;
}

export interface ListingReport {
  id: string;
  targetType?: 'listing' | 'seller' | 'buyer';
  listingId?: string;
  listingTitle?: string;
  reportedUserId?: string;
  reportedUserName?: string;
  sellerId?: string;
  sellerName?: string;
  reporterId?: string;
  reporterName?: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reason: 
    | 'Scam / Suspicious' 
    | 'Counterfeit Item' 
    | 'Inappropriate Content' 
    | 'Extortionate Price' 
    | 'Wrong Category' 
    | 'Unsafe Meetup Request'
    | 'Harassment'
    | 'Other';
  details: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'message' | 'system' | 'safety' | 'review' | 'verification';
  timestamp: string;
  isRead: boolean;
  targetTab?: 'messages' | 'orders' | 'profile' | 'home' | 'admin';
  targetId?: string;
}

export type TabType = 'home' | 'categories' | 'sell' | 'messages' | 'profile' | 'admin' | 'orders' | 'search';

export interface SearchFilterState {
  category: string;
  school: string;
  campus: string;
  condition: 'All' | 'New' | 'Used';
  itemType: 'all' | 'product' | 'service';
  minPrice: string | number;
  maxPrice: string | number;
  sortBy: 'relevant' | 'recent' | 'price_asc' | 'price_desc' | 'popular';
  campusScope: 'my_campus' | 'all';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  school: string;
  condition: 'All' | 'New' | 'Used';
  itemType: 'all' | 'product' | 'service';
  minPrice: number | '';
  maxPrice: number | '';
  sortBy: 'recent' | 'price_asc' | 'price_desc' | 'popular';
}

export type InstitutionCategory = 
  | 'University' 
  | 'Polytechnic' 
  | 'College of Education' 
  | 'College of Nursing Sciences' 
  | 'Other';

export type InstitutionType = 
  | 'Federal University' 
  | 'State University' 
  | 'Private University' 
  | 'Polytechnic' 
  | 'College of Education' 
  | 'College of Nursing Sciences' 
  | 'College of Health & Nursing'
  | 'Monotechnic & Other';

export type GeoZone = 
  | 'South East' 
  | 'South West' 
  | 'South South' 
  | 'North Central' 
  | 'North East' 
  | 'North West';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  aliases?: string[];
  state: string;
  city?: string;
  geoZone?: GeoZone;
  category: InstitutionCategory;
  type: InstitutionType;
  campuses: string[];
  faculties: string[];
  departments?: string[];
  programmes?: string[];
  meetupPoints: string[];
  isActive: boolean;
  website?: string;
}
