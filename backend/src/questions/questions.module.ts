import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    MulterModule.register({ dest: './uploads/questions' }),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
