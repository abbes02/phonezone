import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderDeliveryOption, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product, ProductCategory } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { LoyaltyService } from '../loyalty/loyalty.service';

const DELIVERY_FEE = 4;
const FREE_DELIVERY_THRESHOLD = 15;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly notificationsService: NotificationsService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  /**
   * Create a new order from cart items.
   * Validates stock, decrements quantities, marks screen protectors.
   * Requirements: 4.5, 4.7, 16.1, 16.2
   */
  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ order: Order; paymentInfo: string }> {
    if (
      dto.deliveryOption === OrderDeliveryOption.HOME_DELIVERY &&
      (!dto.deliveryAddress || !dto.deliveryCity || !dto.deliveryPhone)
    ) {
      throw new ConflictException(
        'Adresse, ville et numero de telephone sont requis pour la livraison a domicile',
      );
    }

    const items = Object.values(
      dto.items.reduce<Record<string, { productId: string; quantity: number }>>((acc, item) => {
        acc[item.productId] = acc[item.productId] ?? { productId: item.productId, quantity: 0 };
        acc[item.productId].quantity += item.quantity;
        return acc;
      }, {}),
    );

    // Load products and validate stock
    const products: Product[] = [];
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Produit avec l'identifiant "${item.productId}" introuvable`,
        );
      }
      if (product.stockQuantity < item.quantity) {
        throw new ConflictException(
          `Stock insuffisant pour le produit "${product.name}". Disponible : ${product.stockQuantity}, demandé : ${item.quantity}`,
        );
      }
      products.push(product);
    }

    const screenProtectorCount = items.reduce((sum, item, index) => {
      return products[index].category === ProductCategory.SCREEN_PROTECTOR
        ? sum + item.quantity
        : sum;
    }, 0);
    const screenProtectorBenefit = await this.loyaltyService.consumeScreenProtectorBenefits(
      userId,
      screenProtectorCount,
    );
    let remainingFreeScreenProtectors = screenProtectorBenefit.freeCount;

    // Calculate total amount
// Calculate products total amount
let productsTotalAmount = 0;

for (let i = 0; i < items.length; i++) {
  const product = products[i];

  const freeQuantity =
    product.category === ProductCategory.SCREEN_PROTECTOR
      ? Math.min(remainingFreeScreenProtectors, items[i].quantity)
      : 0;

  remainingFreeScreenProtectors -= freeQuantity;

  productsTotalAmount += Number(product.price) * (items[i].quantity - freeQuantity);
}

// Delivery fee rule
const deliveryFee =
  dto.deliveryOption === OrderDeliveryOption.HOME_DELIVERY &&
  productsTotalAmount <= FREE_DELIVERY_THRESHOLD
    ? DELIVERY_FEE
    : 0;

// Final total = products + delivery
const totalAmount = productsTotalAmount + deliveryFee;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the order
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      status: OrderStatus.PENDING,
      totalAmount,
      deliveryOption: dto.deliveryOption,
      deliveryAddress:
        dto.deliveryOption === OrderDeliveryOption.HOME_DELIVERY ? dto.deliveryAddress : undefined,
      deliveryCity:
        dto.deliveryOption === OrderDeliveryOption.HOME_DELIVERY ? dto.deliveryCity : undefined,
      deliveryPhone:
        dto.deliveryOption === OrderDeliveryOption.HOME_DELIVERY ? dto.deliveryPhone : undefined,
    });
    const savedOrder = await this.orderRepository.save(order);

    // Create order items and decrement stock
    remainingFreeScreenProtectors = screenProtectorBenefit.freeCount;
    for (let i = 0; i < items.length; i++) {
      const product = products[i];
      const item = items[i];
      const freeQuantity =
        product.category === ProductCategory.SCREEN_PROTECTOR
          ? Math.min(remainingFreeScreenProtectors, item.quantity)
          : 0;
      remainingFreeScreenProtectors -= freeQuantity;
      const paidQuantity = item.quantity - freeQuantity;

      if (paidQuantity > 0) {
        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: product.id,
          quantity: paidQuantity,
          unitPrice: Number(product.price),
          isScreenProtector: product.category === ProductCategory.SCREEN_PROTECTOR,
        });
        await this.orderItemRepository.save(orderItem);
      }

      if (freeQuantity > 0) {
        const freeOrderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: product.id,
          quantity: freeQuantity,
          unitPrice: 0,
          isScreenProtector: true,
        });
        await this.orderItemRepository.save(freeOrderItem);
      }

      // Decrement stock
      product.stockQuantity -= item.quantity;
      product.isActive = product.stockQuantity > 0;
      await this.productRepository.save(product);
    }

    // Reload order with items
    const fullOrder = await this.findOne(savedOrder.id);

    await this.notificationsService.createNotification({
      type: NotificationType.NEW_ORDER,
      message: `Nouvelle commande: ${fullOrder.orderNumber}`,
      clientName: fullOrder.user?.fullName ?? 'Client',
      relatedEntityId: fullOrder.id,
      relatedEntityType: 'order',
    });

    return {
      order: fullOrder,
      paymentInfo:
        screenProtectorBenefit.freeCount > 0
          ? `${screenProtectorBenefit.freeCount} anti-casse offert applique. Paiement a la livraison`
          : 'Paiement a la livraison',
    };
  }

  /**
   * Get orders for the authenticated client.
   */
  async findMine(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all orders (Admin) with pagination.
   */
  async findAll(query: PaginationQuery): Promise<PaginatedResult<Order>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.orderRepository.findAndCount({
      relations: { items: { product: true }, user: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single order by ID with items.
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { items: { product: true }, user: true },
    });
    if (!order) {
      throw new NotFoundException(`Commande avec l'identifiant "${id}" introuvable`);
    }
    return order;
  }

  /**
   * Update the status of an order (Admin only).
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    return this.orderRepository.save(order);
  }
}
