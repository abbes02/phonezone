import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

import { User, UserRole } from '../auth/entities/user.entity';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async findAll(query: PaginationQuery): Promise<PaginatedResult<SafeUser>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where = query.search
      ? [
          { fullName: ILike(`%${query.search}%`) },
          { email: ILike(`%${query.search}%`) },
        ]
      : undefined;

    const [users, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: users as SafeUser[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur "${id}" introuvable`);
    }

    user.role = String(user.role).toUpperCase() as UserRole;

    return user as SafeUser;
  }

  async updateRole(
    id: string,
    role: UserRole,
    requesterId: string,
  ): Promise<SafeUser> {
    const normalizedRole = String(role).toUpperCase() as UserRole;

    if (![UserRole.ADMIN, UserRole.CLIENT].includes(normalizedRole)) {
      throw new BadRequestException('Rôle invalide');
    }

    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur "${id}" introuvable`);
    }

    if (id === requesterId && normalizedRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Impossible de retirer votre propre rôle admin',
      );
    }

    user.role = normalizedRole;

    await this.userRepo.save(user);

    /*
      Important :
      Avant, ton code faisait blacklist:user:${id}.
      Ça bloque même les nouveaux tokens après connexion.
      Donc quand un compte devient ADMIN, il ne pouvait pas accéder à l’espace admin.
      Ici on supprime la blacklist pour permettre une nouvelle connexion propre.
    */
    await this.removeUserBlacklist(id);

    return this.findOne(id);
  }

  async deactivate(
    id: string,
    requesterId: string,
  ): Promise<{ message: string; user: SafeUser }> {
    if (id === requesterId) {
      throw new ForbiddenException(
        'Impossible de désactiver votre propre compte',
      );
    }

    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur "${id}" introuvable`);
    }

    user.isActive = false;

    await this.userRepo.save(user);

    await this.blacklistUser(id);

    return {
      message: 'Compte désactivé avec succès',
      user: await this.findOne(id),
    };
  }

  async activate(id: string): Promise<{ message: string; user: SafeUser }> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur "${id}" introuvable`);
    }

    user.isActive = true;

    await this.userRepo.save(user);

    await this.removeUserBlacklist(id);

    return {
      message: 'Compte réactivé avec succès',
      user: await this.findOne(id),
    };
  }

  async toggleStatus(
    id: string,
    requesterId: string,
  ): Promise<{ message: string; user: SafeUser }> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur "${id}" introuvable`);
    }

    if (id === requesterId && user.isActive) {
      throw new ForbiddenException(
        'Impossible de désactiver votre propre compte',
      );
    }

    user.isActive = !user.isActive;

    await this.userRepo.save(user);

    if (user.isActive) {
      await this.removeUserBlacklist(id);

      return {
        message: 'Compte réactivé avec succès',
        user: await this.findOne(id),
      };
    }

    await this.blacklistUser(id);

    return {
      message: 'Compte désactivé avec succès',
      user: await this.findOne(id),
    };
  }

  private async blacklistUser(id: string): Promise<void> {
    try {
      await this.redisClient.set(`blacklist:user:${id}`, '1', 'EX', 3600);
    } catch {
      // Redis peut être indisponible en développement
    }
  }

  private async removeUserBlacklist(id: string): Promise<void> {
    try {
      await this.redisClient.del(`blacklist:user:${id}`);
    } catch {
      // Redis peut être indisponible en développement
    }
  }
}