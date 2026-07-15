import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RecoveryOption } from '../entities/repair-request.entity';

export class SetRecoveryOptionDto {
  @IsEnum(RecoveryOption)
  option!: RecoveryOption;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @IsString()
  @IsOptional()
  deliveryCity?: string;

  @IsString()
  @IsOptional()
  deliveryPhone?: string;
}
