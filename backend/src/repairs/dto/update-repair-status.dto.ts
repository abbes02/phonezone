import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { RepairStatus } from '../entities/repair-request.entity';

export class UpdateRepairStatusDto {
  @IsEnum(RepairStatus, { message: 'Statut invalide. Valeurs acceptees : PENDING, IN_PROGRESS, READY' })
  status!: RepairStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;
}
