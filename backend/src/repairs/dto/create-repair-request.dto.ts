import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateRepairRequestDto {
  @IsUUID()
  serviceId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le modèle de téléphone est requis' })
  phoneModel!: string;

  @IsString()
  @IsNotEmpty({ message: 'La description du problème est requise' })
  problemDescription!: string;

  @IsString()
  @IsNotEmpty({ message: 'Les coordonnées de contact sont requises' })
  contactInfo!: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  desiredDropOffSlot?: string;

  @IsIn(['IN_STORE', 'PICKUP_BY_DELIVERY'])
  @IsOptional()
  @Transform(({ value }) => value === '' ? 'IN_STORE' : value)
  dropOffOption?: 'IN_STORE' | 'PICKUP_BY_DELIVERY';

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  pickupPhone?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  pickupCity?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  pickupAddress?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  pickupSlot?: string;
}