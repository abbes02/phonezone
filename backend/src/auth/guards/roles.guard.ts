import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

type RequestUser = {
  id: string;
  email: string;
  role?: UserRole | string | null;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Accès refusé : utilisateur non authentifié');
    }

    const userRole = String(user.role ?? '').toUpperCase();
    const allowedRoles = requiredRoles.map((role) => String(role).toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Accès refusé : rôle admin requis');
    }

    return true;
  }
}