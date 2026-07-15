import { IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../auth/entities/user.entity';

export class UpdateRoleDto {
  @Transform(({ value }) => String(value).toUpperCase())
  @IsEnum(UserRole, {
    message: 'Rôle invalide. Valeurs acceptées : CLIENT, ADMIN',
  })
  role!: UserRole;
}