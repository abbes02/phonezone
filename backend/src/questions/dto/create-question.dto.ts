import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le sujet est requis' })
  @MaxLength(255)
  subject!: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est requise' })
  description!: string;
}
