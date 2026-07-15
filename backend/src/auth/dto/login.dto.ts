import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: "L'adresse email est requise" })
  @IsEmail({}, { message: "L'adresse email est invalide" })
  email!: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString()
  password!: string;
}
