import { IsString, IsNotEmpty } from 'class-validator';

export class AnswerQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'La réponse ne peut pas être vide' })
  adminResponse!: string;
}
