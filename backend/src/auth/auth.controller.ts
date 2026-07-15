import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from './entities/user.entity';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Create a new user account
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/auth/login
   * Authenticate and receive JWT
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/auth/logout
   * Blacklist the current token in Redis
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedRequest) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : '';
    return this.authService.logout(token);
  }

  /**
   * GET /api/auth/me
   * Return the current authenticated user's profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.findById(req.user.id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
