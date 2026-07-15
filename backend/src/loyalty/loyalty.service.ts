import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyCounter } from './entities/loyalty-counter.entity';
import { LoyaltyVoucher, VoucherType } from './entities/loyalty-voucher.entity';

export interface LoyaltyIncrementResult {
  counter: LoyaltyCounter;
  vouchersCreated: LoyaltyVoucher[];
}

export interface ScreenProtectorBenefitResult {
  counter: LoyaltyCounter;
  paidCount: number;
  freeCount: number;
  vouchersUsed: LoyaltyVoucher[];
  vouchersCreated: LoyaltyVoucher[];
}

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyCounter)
    private readonly counterRepo: Repository<LoyaltyCounter>,
    @InjectRepository(LoyaltyVoucher)
    private readonly voucherRepo: Repository<LoyaltyVoucher>,
  ) {}

  // ── Init: create counter on user creation ─────────────────────────────────

  async initCounter(userId: string): Promise<LoyaltyCounter> {
    const counter = this.counterRepo.create({ userId, screenProtectorCount: 0, repairCount: 0 });
    return this.counterRepo.save(counter);
  }

  // ── Get or create counter ─────────────────────────────────────────────────

  private async getCounter(userId: string): Promise<LoyaltyCounter> {
    let counter = await this.counterRepo.findOne({ where: { userId } });
    if (!counter) {
      counter = await this.initCounter(userId);
    }
    return counter;
  }

  // ── Screen protector counter ──────────────────────────────────────────────

  async incrementScreenProtector(userId: string, count: number): Promise<LoyaltyIncrementResult> {
    const counter = await this.getCounter(userId);
    const before = counter.screenProtectorCount;
    counter.screenProtectorCount = before + count;
    const saved = await this.counterRepo.save(counter);
    const vouchersCreated: LoyaltyVoucher[] = [];

    // Generate voucher for each multiple of 5 crossed
    const crossedMultiples = Math.floor(saved.screenProtectorCount / 5) - Math.floor(before / 5);
    for (let i = 0; i < crossedMultiples; i++) {
      vouchersCreated.push(
        await this.voucherRepo.save(
          this.voucherRepo.create({ userId, type: VoucherType.SCREEN_PROTECTOR_FREE }),
        ),
      );
    }

    return { counter: saved, vouchersCreated };
  }

  async decrementScreenProtector(userId: string, count: number): Promise<LoyaltyCounter> {
    const counter = await this.getCounter(userId);
    counter.screenProtectorCount = Math.max(0, counter.screenProtectorCount - count);
    return this.counterRepo.save(counter);
  }

  async consumeScreenProtectorBenefits(
    userId: string,
    requestedCount: number,
  ): Promise<ScreenProtectorBenefitResult> {
    const counter = await this.getCounter(userId);
    const vouchersUsed: LoyaltyVoucher[] = [];
    const vouchersCreated: LoyaltyVoucher[] = [];

    if (requestedCount <= 0) {
      return { counter, paidCount: 0, freeCount: 0, vouchersUsed, vouchersCreated };
    }

    const activeVouchers = await this.voucherRepo.find({
      where: { userId, type: VoucherType.SCREEN_PROTECTOR_FREE, isUsed: false },
      order: { generatedAt: 'ASC' },
    });

    let remaining = requestedCount;
    let paidCount = 0;
    let freeCount = 0;
    let progress = counter.screenProtectorCount % 5;

    while (remaining > 0) {
      const voucher = activeVouchers.shift();
      if (voucher) {
        voucher.isUsed = true;
        voucher.usedAt = new Date();
        vouchersUsed.push(await this.voucherRepo.save(voucher));
        freeCount += 1;
        remaining -= 1;
        continue;
      }

      const paidNeededForReward = 5 - progress;
      const paidNow = Math.min(paidNeededForReward, remaining);
      paidCount += paidNow;
      remaining -= paidNow;
      progress += paidNow;

      if (progress === 5) {
        progress = 0;
        if (remaining > 0) {
          freeCount += 1;
          remaining -= 1;
        } else {
          vouchersCreated.push(
            await this.voucherRepo.save(
              this.voucherRepo.create({ userId, type: VoucherType.SCREEN_PROTECTOR_FREE }),
            ),
          );
        }
      }
    }

    counter.screenProtectorCount += paidCount;
    const saved = await this.counterRepo.save(counter);

    return { counter: saved, paidCount, freeCount, vouchersUsed, vouchersCreated };
  }

  // ── Repair counter ────────────────────────────────────────────────────────

  async incrementRepairCount(userId: string): Promise<LoyaltyIncrementResult> {
    const counter = await this.getCounter(userId);
    const before = counter.repairCount;
    counter.repairCount = before + 1;
    const saved = await this.counterRepo.save(counter);
    const vouchersCreated: LoyaltyVoucher[] = [];

    // Generate voucher at each multiple of 5
    const crossedMultiples = Math.floor(saved.repairCount / 5) - Math.floor(before / 5);
    for (let i = 0; i < crossedMultiples; i++) {
      vouchersCreated.push(
        await this.voucherRepo.save(
          this.voucherRepo.create({ userId, type: VoucherType.REPAIR_DISCOUNT_50 }),
        ),
      );
    }

    return { counter: saved, vouchersCreated };
  }

  // ── Get loyalty data ──────────────────────────────────────────────────────

  async getLoyaltyData(userId: string): Promise<{
    counter: LoyaltyCounter;
    activeVouchers: LoyaltyVoucher[];
    nextFreeScreenProtectorIn: number;
    nextRepairDiscountIn: number;
  }> {
    const counter = await this.getCounter(userId);
    const activeVouchers = await this.voucherRepo.find({
      where: { userId, isUsed: false },
      order: { generatedAt: 'ASC' },
    });

    const nextFreeScreenProtectorIn = 5 - (counter.screenProtectorCount % 5);
    const nextRepairDiscountIn = 5 - (counter.repairCount % 5);

    return { counter, activeVouchers, nextFreeScreenProtectorIn, nextRepairDiscountIn };
  }

  // ── Apply voucher ─────────────────────────────────────────────────────────

  async applyVoucher(userId: string, type: VoucherType): Promise<LoyaltyVoucher | null> {
    const voucher = await this.voucherRepo.findOne({
      where: { userId, type, isUsed: false },
      order: { generatedAt: 'ASC' },
    });
    if (!voucher) return null;

    voucher.isUsed = true;
    voucher.usedAt = new Date();
    return this.voucherRepo.save(voucher);
  }

  // ── Check if active voucher exists ────────────────────────────────────────

  async hasActiveVoucher(userId: string, type: VoucherType): Promise<boolean> {
    const count = await this.voucherRepo.count({ where: { userId, type, isUsed: false } });
    return count > 0;
  }
}
