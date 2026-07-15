import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RepairService } from './entities/repair-service.entity';
import { CreateRepairServiceDto } from './dto/create-repair-service.dto';
import { UpdateRepairServiceDto } from './dto/update-repair-service.dto';

@Injectable()
export class RepairServiceManager {
  constructor(
    @InjectRepository(RepairService)
    private readonly repairServiceRepository: Repository<RepairService>,
  ) {}

  async findAll(): Promise<RepairService[]> {
    return this.repairServiceRepository.find({
      where: {
        isDeleted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RepairService> {
    const service = await this.repairServiceRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!service) {
      throw new NotFoundException(
        `Service de réparation avec l'identifiant "${id}" introuvable`,
      );
    }

    return service;
  }

  async create(dto: CreateRepairServiceDto): Promise<RepairService> {
    const service = this.repairServiceRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
      isDeleted: false,
    });

    return this.repairServiceRepository.save(service);
  }

  async update(id: string, dto: UpdateRepairServiceDto): Promise<RepairService> {
    const service = await this.findOne(id);

    Object.assign(service, dto);

    return this.repairServiceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);

    service.isDeleted = true;
    service.isActive = false;

    await this.repairServiceRepository.save(service);
  }
}