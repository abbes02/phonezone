export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'PHONE' | 'ACCESSORY' | 'SCREEN_PROTECTOR';
  price: number;
  stockQuantity: number;
  imageUrls: string[];
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  isScreenProtector: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  deliveryOption: 'PICKUP' | 'HOME_DELIVERY';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPhone?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface RepairService {
  id: string;
  name: string;
  description: string;
  indicativePrice?: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface StatusHistory {
  id: string;
  status: string;
  changedAt: string;
  changedByAdminId?: string;
}

export interface RepairRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  serviceId: string;
  service: RepairService;
  user?: User;
  phoneModel: string;
  problemDescription: string;
  contactInfo: string;
  photoUrls: string[];

  dropOffOption?: 'IN_STORE' | 'PICKUP_BY_DELIVERY';
  pickupAddress?: string;
  pickupCity?: string;
  pickupPhone?: string;
  pickupSlot?: string;

  status: 'PENDING' | 'IN_PROGRESS' | 'READY';
  recoveryOption?: 'IN_STORE' | 'HOME_DELIVERY';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPhone?: string;
  finalPrice?: number;
  discountApplied: boolean;
  statusHistory: StatusHistory[];
  createdAt: string;
}

export interface LoyaltyCounter {
  screenProtectorCount: number;
  repairCount: number;
}

export interface LoyaltyVoucher {
  id: string;
  type: 'SCREEN_PROTECTOR_FREE' | 'REPAIR_DISCOUNT_50';
  isUsed: boolean;
  generatedAt: string;
}

export interface LoyaltyData {
  counter: LoyaltyCounter;
  activeVouchers: LoyaltyVoucher[];
  nextFreeScreenProtectorIn: number;
  nextRepairDiscountIn: number;
}

export interface Question {
  id: string;
  questionNumber: string;
  subject: string;
  description: string;
  photoUrls: string[];
  isAnswered: boolean;
  adminResponse?: string;
  answeredAt?: string;
  createdAt: string;
  user?: User;
}

export interface Notification {
  id: string;
  type: 'NEW_ORDER' | 'NEW_REPAIR' | 'NEW_QUESTION' | 'RECOVERY_CHOICE' | 'LOYALTY_REWARD';
  message: string;
  clientName: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
