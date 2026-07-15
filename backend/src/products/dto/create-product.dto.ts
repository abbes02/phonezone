import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stockQuantity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  isActive?: boolean;
}