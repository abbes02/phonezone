import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

import { ProductsService, FindAllQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { ProductCategory } from './entities/product.entity';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const productStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const destination = './uploads/products';
    mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

function mapUploadedImages(
  files: Express.Multer.File[] | undefined,
): string[] | undefined {
  if (!files || files.length === 0) return undefined;

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Image invalide : ${file.originalname}. Formats acceptés : JPEG, PNG, WEBP`,
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `Image trop grande : ${file.originalname}. Taille maximum : 5 Mo`,
      );
    }
  }

  return files.map((file) => file.path.replace(/\\/g, '/'));
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('category') category?: ProductCategory,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query: FindAllQuery = {
      category,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: productStorage,
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadedImages = mapUploadedImages(files);

    if (uploadedImages) {
      createProductDto.imageUrls = uploadedImages;
    }

    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: productStorage,
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadedImages = mapUploadedImages(files);

    if (uploadedImages) {
      updateProductDto.imageUrls = uploadedImages;
    }

    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}