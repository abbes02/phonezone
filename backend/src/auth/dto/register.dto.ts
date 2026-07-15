import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @IsString()
  fullName!: string;

  @IsNotEmpty({ message: "L'adresse email est requise" })
  @IsEmail({}, { message: "L'adresse email est invalide" })
  email!: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  password!: string;
}
