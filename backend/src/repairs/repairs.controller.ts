import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { Request } from 'express';
import { RepairsService } from './repairs.service';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { UpdateRepairStatusDto } from './dto/update-repair-status.dto';
import { SetRecoveryOptionDto } from './dto/set-recovery-option.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

interface AuthRequest extends Request {
  user: { id: string; email: string; role: UserRole };
}

const repairStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const destination = './uploads/repairs';
    mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('repair-requests')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  /** POST /api/repair-requests — Client */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('photos', 10, { storage: repairStorage }))
  create(
    @Req() req: AuthRequest,
    @Body() dto: CreateRepairRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.repairsService.create(req.user.id, dto, files ?? []);
  }

  /** GET /api/repair-requests/mine — Client */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: AuthRequest) {
    return this.repairsService.findMine(req.user.id);
  }

  /** GET /api/repair-requests — Admin */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.repairsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** GET /api/repair-requests/:id — Authenticated */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.repairsService.findOne(id);
  }

  /** PATCH /api/repair-requests/:id/status — Admin */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRepairStatusDto,
    @Req() req: AuthRequest,
  ) {
    return this.repairsService.updateStatus(id, dto, req.user.id);
  }

  /** PATCH /api/repair-requests/:id/recovery — Client */
  @Patch(':id/recovery')
  @UseGuards(JwtAuthGuard)
  setRecovery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetRecoveryOptionDto,
    @Req() req: AuthRequest,
  ) {
    return this.repairsService.setRecoveryOption(id, req.user.id, dto);
  }
}
