import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface PaginationQuery { page?: number; limit?: number; }
export interface PaginatedResult<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createQuestion(
    userId: string,
    dto: CreateQuestionDto,
    files: Express.Multer.File[],
  ): Promise<Question> {
    // Validate description not empty (belt-and-suspenders beyond DTO)
    if (!dto.description?.trim()) {
      throw new BadRequestException('La description est requise');
    }

    // Validate each uploaded file
    const photoUrls: string[] = [];
    for (const file of files ?? []) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Format non supporté : ${file.originalname}. Formats acceptés : JPEG, PNG, WEBP`,
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `Taille maximale dépassée pour : ${file.originalname}. Maximum : 5 Mo`,
        );
      }
      photoUrls.push(file.path ?? file.originalname);
    }

    const questionNumber = `QST-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const question = this.questionRepo.create({
      questionNumber,
      userId,
      subject: dto.subject,
      description: dto.description,
      photoUrls,
    });

    const saved = await this.questionRepo.save(question);
    const fullQuestion = await this.questionRepo.findOne({
      where: { id: saved.id },
      relations: { user: true },
    });

    await this.notificationsService.createNotification({
      type: NotificationType.NEW_QUESTION,
      message: `Nouvelle question: ${saved.subject}`,
      clientName: fullQuestion?.user?.fullName ?? 'Client',
      relatedEntityId: saved.id,
      relatedEntityType: 'question',
    });

    return saved;
  }

  async findMine(userId: string): Promise<Question[]> {
    return this.questionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Question>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const [data, total] = await this.questionRepo.findAndCount({
      relations: { user: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Question> {
    const q = await this.questionRepo.findOne({ where: { id }, relations: { user: true } });
    if (!q) throw new NotFoundException(`Question "${id}" introuvable`);
    return q;
  }

  async answerQuestion(id: string, dto: AnswerQuestionDto): Promise<Question> {
    const question = await this.findOne(id);
    question.adminResponse = dto.adminResponse;
    question.isAnswered = true;
    question.answeredAt = new Date();
    return this.questionRepo.save(question);
  }
}
