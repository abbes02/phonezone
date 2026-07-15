import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RepairRequest,
  RepairStatus,
  RecoveryOption,
  DropOffOption,
} from './entities/repair-request.entity';
import { RepairStatusHistory } from './entities/repair-status-history.entity';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairStatusDto } from './dto/update-repair-status.dto';
import { SetRecoveryOptionDto } from './dto/set-recovery-option.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { EventsGateway } from '../events/events.gateway';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { VoucherType } from '../loyalty/entities/loyalty-voucher.entity';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_ORDER: Record<RepairStatus, number> = {
  [RepairStatus.PENDING]: 0,
  [RepairStatus.IN_PROGRESS]: 1,
  [RepairStatus.READY]: 2,
};

@Injectable()
export class RepairsService {
  constructor(
    @InjectRepository(RepairRequest)
    private readonly repairRepo: Repository<RepairRequest>,

    @InjectRepository(RepairStatusHistory)
    private readonly historyRepo: Repository<RepairStatusHistory>,

    private readonly notificationsService: NotificationsService,
    private readonly eventsGateway: EventsGateway,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  // ── Client: Create repair request ────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateRepairRequestDto,
    files: Express.Multer.File[] = [],
  ): Promise<{ repair: RepairRequest; paymentInfo: string }> {
    const referenceNumber = `REP-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const photoUrls = this.validateAndMapImages(files);

    const requestedDropOffOption = String(dto.dropOffOption ?? 'IN_STORE');

    const dropOffOption =
      requestedDropOffOption === DropOffOption.PICKUP_BY_DELIVERY
        ? DropOffOption.PICKUP_BY_DELIVERY
        : DropOffOption.IN_STORE;

    if (
      dropOffOption === DropOffOption.PICKUP_BY_DELIVERY &&
      (!dto.pickupPhone || !dto.pickupAddress)
    ) {
      throw new BadRequestException(
        'Le téléphone et l’adresse sont obligatoires pour envoyer un livreur',
      );
    }

    const repair = this.repairRepo.create({
      referenceNumber,
      userId,
      serviceId: dto.serviceId,
      phoneModel: dto.phoneModel,
      problemDescription: dto.problemDescription,
      contactInfo: dto.contactInfo,
      photoUrls,

      desiredDropOffSlot:
        dropOffOption === DropOffOption.IN_STORE && dto.desiredDropOffSlot
          ? new Date(dto.desiredDropOffSlot)
          : undefined,

      dropOffOption,

      pickupPhone:
        dropOffOption === DropOffOption.PICKUP_BY_DELIVERY
          ? dto.pickupPhone
          : undefined,

      pickupCity:
        dropOffOption === DropOffOption.PICKUP_BY_DELIVERY
          ? 'Sousse'
          : undefined,

      pickupAddress:
        dropOffOption === DropOffOption.PICKUP_BY_DELIVERY
          ? dto.pickupAddress
          : undefined,

      pickupSlot:
        dropOffOption === DropOffOption.PICKUP_BY_DELIVERY && dto.pickupSlot
          ? new Date(dto.pickupSlot)
          : undefined,

      status: RepairStatus.PENDING,
      discountApplied: false,
    });

    const saved = await this.repairRepo.save(repair);

    await this.historyRepo.save(
      this.historyRepo.create({
        repairRequestId: saved.id,
        status: RepairStatus.PENDING,
      }),
    );

    const fullRepair = await this.findOne(saved.id);

    const pickupText =
      dropOffOption === DropOffOption.PICKUP_BY_DELIVERY
        ? ' - Livreur à envoyer chez le client'
        : ' - Dépôt en boutique';

    await this.notificationsService.createNotification({
      type: NotificationType.NEW_REPAIR,
      message: `Nouvelle demande de reparation: ${saved.referenceNumber}${pickupText}`,
      clientName: fullRepair.user?.fullName ?? 'Client',
      relatedEntityId: saved.id,
      relatedEntityType: 'repair',
    });

    return {
      repair: fullRepair,
      paymentInfo: 'Aucun frais de reparation affiche avant diagnostic',
    };
  }

  private validateAndMapImages(files: Express.Multer.File[]): string[] {
    return (files ?? []).map((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Format non supporte : ${file.originalname}. Formats acceptes : JPEG, PNG, WEBP`,
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `Taille maximale depassee pour : ${file.originalname}. Maximum : 5 Mo`,
        );
      }

      return file.path;
    });
  }

  // ── Client: My repair requests ────────────────────────────────────────────

  async findMine(userId: string): Promise<RepairRequest[]> {
    return this.repairRepo.find({
      where: { userId },
      relations: { service: true, statusHistory: true },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Admin: All repair requests ────────────────────────────────────────────

  async findAll(query: PaginationQuery): Promise<PaginatedResult<RepairRequest>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repairRepo.findAndCount({
      relations: { service: true, user: true, statusHistory: true },
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

  // ── Shared: Get one repair request ────────────────────────────────────────

  async findOne(id: string): Promise<RepairRequest> {
    const repair = await this.repairRepo.findOne({
      where: { id },
      relations: { service: true, user: true, statusHistory: true },
    });

    if (!repair) {
      throw new NotFoundException(`Demande de réparation "${id}" introuvable`);
    }

    return repair;
  }

  // ── Admin: Update status ──────────────────────────────────────────────────

  async updateStatus(
    id: string,
    dto: UpdateRepairStatusDto,
    adminId: string,
  ): Promise<RepairRequest> {
    const repair = await this.findOne(id);

    const currentOrder = STATUS_ORDER[repair.status];
    const newOrder = STATUS_ORDER[dto.status];

    if (newOrder <= currentOrder) {
      throw new BadRequestException(
        `Le statut ne peut pas régresser. Statut actuel : "${repair.status}", statut demandé : "${dto.status}"`,
      );
    }

    if (
      dto.status === RepairStatus.READY &&
      (dto.finalPrice === undefined || dto.finalPrice <= 0)
    ) {
      throw new BadRequestException(
        'Le prix final est obligatoire lorsque la reparation est prete',
      );
    }

    repair.status = dto.status;

    if (dto.status === RepairStatus.READY) {
      const discountVoucher = await this.loyaltyService.applyVoucher(
        repair.userId,
        VoucherType.REPAIR_DISCOUNT_50,
      );

      repair.discountApplied = Boolean(discountVoucher);
      repair.finalPrice = discountVoucher
        ? Number(dto.finalPrice) / 2
        : dto.finalPrice;
    }

    const updated = await this.repairRepo.save(repair);

    const history = await this.historyRepo.save(
      this.historyRepo.create({
        repairRequestId: updated.id,
        status: dto.status,
        changedByAdminId: adminId,
      }),
    );

    const loyaltyResult =
      dto.status === RepairStatus.READY
        ? await this.loyaltyService.incrementRepairCount(updated.userId)
        : null;

    if (loyaltyResult?.vouchersCreated.length) {
      const fullRepair = await this.findOne(updated.id);

      await this.notificationsService.createNotification({
        type: NotificationType.LOYALTY_REWARD,
        message: `Fidelite: ${
          fullRepair.user?.fullName ?? 'Client'
        } a complete 5 reparations. Avantage fidelite disponible.`,
        clientName: fullRepair.user?.fullName ?? 'Client',
        relatedEntityId: updated.id,
        relatedEntityType: 'repair',
      });

      this.eventsGateway.server
        .to(`user:${updated.userId}`)
        .emit('loyalty-reward', {
          type: VoucherType.REPAIR_DISCOUNT_50,
          message:
            'Vous avez complete 5 reparations. Un avantage fidelite est disponible.',
          repairCount: loyaltyResult.counter.repairCount,
        });
    }

    this.eventsGateway.server
      .to(`user:${updated.userId}`)
      .emit('repair-status-update', {
        id: updated.id,
        referenceNumber: updated.referenceNumber,
        status: updated.status,
        finalPrice: updated.finalPrice,
        discountApplied: updated.discountApplied,
        changedAt: history.changedAt,
        history,
      });

    return this.findOne(updated.id);
  }

  // ── Client: Set recovery option when status is READY ──────────────────────

  async setRecoveryOption(
    id: string,
    userId: string,
    dto: SetRecoveryOptionDto,
  ): Promise<{ repair: RepairRequest; paymentInfo: string }> {
    const repair = await this.findOne(id);

    if (repair.userId !== userId) {
      throw new ForbiddenException('Accès interdit');
    }

    if (repair.status !== RepairStatus.READY) {
      throw new BadRequestException(
        "Le choix de récupération n'est disponible que lorsque le téléphone est prêt",
      );
    }

    if (
      dto.option === RecoveryOption.HOME_DELIVERY &&
      (!dto.deliveryAddress || !dto.deliveryCity || !dto.deliveryPhone)
    ) {
      throw new BadRequestException(
        'Adresse, ville et numero de telephone sont requis pour la livraison a domicile',
      );
    }

    repair.recoveryOption = dto.option;

    if (dto.option === RecoveryOption.HOME_DELIVERY) {
      repair.deliveryAddress = dto.deliveryAddress;
      repair.deliveryCity = dto.deliveryCity;
      repair.deliveryPhone = dto.deliveryPhone;
    } else {
      repair.deliveryAddress = undefined;
      repair.deliveryCity = undefined;
      repair.deliveryPhone = undefined;
    }

    const updated = await this.repairRepo.save(repair);

    const paymentInfo =
      dto.option === RecoveryOption.HOME_DELIVERY
        ? 'Paiement à la remise du téléphone par le livreur'
        : 'Paiement en boutique lors du retrait';

    const fullRepair = await this.findOne(updated.id);

    await this.notificationsService.createNotification({
      type: NotificationType.RECOVERY_CHOICE,
      message: `Choix de recuperation pour ${updated.referenceNumber}: ${dto.option}`,
      clientName: fullRepair.user?.fullName ?? 'Client',
      relatedEntityId: updated.id,
      relatedEntityType: 'repair',
    });

    return {
      repair: fullRepair,
      paymentInfo,
    };
  }
}