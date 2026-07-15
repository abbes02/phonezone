import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';

import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface FindAllQuery {
  category?: ProductCategory;
  search?: string;
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(query: FindAllQuery): Promise<PaginatedResult<Product>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;
    const skip = (page - 1) * limit;

    const baseWhere: FindOptionsWhere<Product> = {
      isDeleted: false,
    };

    let where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] = baseWhere;

    if (query.category && query.search) {
      where = [
        {
          ...baseWhere,
          category: query.category,
          name: ILike(`%${query.search}%`),
        },
        {
          ...baseWhere,
          category: query.category,
          description: ILike(`%${query.search}%`),
        },
      ];
    } else if (query.category) {
      where = {
        ...baseWhere,
        category: query.category,
      };
    } else if (query.search) {
      where = [
        {
          ...baseWhere,
          name: ILike(`%${query.search}%`),
        },
        {
          ...baseWhere,
          description: ILike(`%${query.search}%`),
        },
      ];
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    data.forEach((product) => {
      product.imageUrls = this.cleanImageUrls(product.imageUrls);
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'identifiant "${id}" introuvable`,
      );
    }

    product.imageUrls = this.cleanImageUrls(product.imageUrls);

    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    if (dto.price <= 0) {
      throw new BadRequestException('Le prix doit être supérieur à 0');
    }

    const stockQuantity = dto.stockQuantity ?? 0;

    const product = this.productRepository.create({
      ...dto,
      imageUrls: this.cleanImageUrls(dto.imageUrls),
      stockQuantity,
      isActive: dto.isActive !== undefined ? dto.isActive : stockQuantity > 0,
      isDeleted: false,
    });

    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.price !== undefined && dto.price <= 0) {
      throw new BadRequestException('Le prix doit être supérieur à 0');
    }

    const newUploadedImages = this.cleanImageUrls(dto.imageUrls);

    delete dto.imageUrls;

    Object.assign(product, dto);

    if (newUploadedImages.length > 0) {
      product.imageUrls = [
        ...this.cleanImageUrls(product.imageUrls),
        ...newUploadedImages,
      ];
    }

    if (dto.stockQuantity !== undefined && dto.isActive === undefined) {
      product.isActive = dto.stockQuantity > 0;
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    product.isDeleted = true;
    product.isActive = false;

    await this.productRepository.save(product);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    product.stockQuantity = quantity;
    product.isActive = quantity > 0;

    return this.productRepository.save(product);
  }

  private cleanImageUrls(imageUrls?: string[] | null): string[] {
    if (!imageUrls) return [];

    return imageUrls
      .map((url) => String(url).trim())
      .filter((url) => url.length > 0);
  }
}