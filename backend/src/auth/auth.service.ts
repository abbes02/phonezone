import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';

import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 8 caractères',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.userRepository.create({
      fullName: dto.fullName,
      email,
      passwordHash,
      role: UserRole.CLIENT,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    const token = this.generateToken(savedUser);

    return {
      access_token: token,
      user: {
        id: savedUser.id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: String(savedUser.role).toUpperCase() as UserRole,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email },
    });

    const error = new UnauthorizedException('Identifiants invalides');

    if (!user) throw error;

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw error;

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: String(user.role).toUpperCase() as UserRole,
      },
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      const decoded = this.jwtService.decode(token) as JwtPayload;

      if (decoded?.exp) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - now;

        if (ttl > 0) {
          await this.redisClient.set(`blacklist:${token}`, '1', 'EX', ttl);
        }
      }
    } catch {
      // ignore
    }

    return { message: 'Déconnexion réussie' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist:${token}`);
    return result !== null;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: String(user.role).toUpperCase() as UserRole,
    });
  }
}