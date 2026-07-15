import {
  Body,
  Controller,
  Get,
  Param,
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
import { Request } from 'express';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

interface AuthRequest extends Request {
  user: { id: string; email: string; role: UserRole };
}

const multerStorage = diskStorage({
  destination: './uploads/questions',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /** POST /api/questions — Client (multipart/form-data) */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('photos', 10, { storage: multerStorage }))
  create(
    @Req() req: AuthRequest,
    @Body() dto: CreateQuestionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.questionsService.createQuestion(req.user.id, dto, files ?? []);
  }

  /** GET /api/questions/mine — Client */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: AuthRequest) {
    return this.questionsService.findMine(req.user.id);
  }

  /** GET /api/questions — Admin */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.questionsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** GET /api/questions/:id — Authenticated */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionsService.findOne(id);
  }

  /** POST /api/questions/:id/answer — Admin */
  @Post(':id/answer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  answer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.questionsService.answerQuestion(id, dto);
  }
}
