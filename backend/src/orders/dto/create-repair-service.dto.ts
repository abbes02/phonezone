import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateRepairServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  indicativePrice?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}