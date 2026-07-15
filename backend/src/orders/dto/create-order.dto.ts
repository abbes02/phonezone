import {
  IsArray,
  IsUUID,
  IsInt,
  IsPositive,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDeliveryOption } from '../entities/order.entity';

export class CartItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];

  @IsEnum(OrderDeliveryOption)
  deliveryOption!: OrderDeliveryOption;

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
