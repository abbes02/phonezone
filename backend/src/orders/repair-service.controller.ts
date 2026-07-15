import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { RepairServiceManager } from './repair-service.service';
import { CreateRepairServiceDto } from './dto/create-repair-service.dto';
import { UpdateRepairServiceDto } from './dto/update-repair-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const imageStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const destination = './uploads/repair-services';
    mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

function mapUploadedImage(file?: Express.Multer.File): string | undefined {
  if (!file) return undefined;

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype) || file.size > MAX_IMAGE_SIZE) {
    throw new BadRequestException(
      `Image invalide : ${file.originalname}. Formats acceptés : JPEG, PNG, WEBP, maximum 5 Mo`,
    );
  }

  return file.path.replace(/\\/g, '/');
}

@Controller('repair-services')
export class RepairServiceController {
  constructor(private readonly repairServiceManager: RepairServiceManager) {}

  @Get()
  findAll() {
    return this.repairServiceManager.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  create(
    @Body() dto: CreateRepairServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = mapUploadedImage(file);
    if (imageUrl) dto.imageUrl = imageUrl;

    return this.repairServiceManager.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRepairServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = mapUploadedImage(file);
    if (imageUrl) dto.imageUrl = imageUrl;

    return this.repairServiceManager.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.repairServiceManager.remove(id);
  }
}