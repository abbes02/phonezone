import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stockQuantity?: number;
}
