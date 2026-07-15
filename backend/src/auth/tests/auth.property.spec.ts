/**
 * Property-Based Tests for Authentication
 * Feature: phone-shop-app
 *
 * Tests Properties 1, 2, and 11 using fast-check
 */

import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User, UserRole } from '../entities/user.entity';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { RolesGuard } from '../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  decode: jest.fn(),
};

const mockRedisClient = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
};

// ─── Helper ─────────────────────────────────────────────────────────────────

function buildAuthService(): AuthService {
  return new AuthService(
    mockUserRepository as any,
    mockJwtService as any,
    mockRedisClient as any,
  );
}

// ─── Property 1: Rejet des mots de passe trop courts ────────────────────────

/**
 * Validates: Requirement 1.4
 *
 * Feature: phone-shop-app, Property 1
 *
 * For any password with fewer than 8 characters, register() must throw a BadRequestException.
 */
describe('Property 1 — Rejet des mots de passe trop courts', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = buildAuthService();
  });

  it('should reject any password shorter than 8 characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings of length 0 to 7 (strictly < 8)
        fc.string({ maxLength: 7 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        async (shortPassword, fullName, email) => {
          mockUserRepository.findOne.mockResolvedValue(null);

          await expect(
            authService.register({ password: shortPassword, fullName, email }),
          ).rejects.toThrow(BadRequestException);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2: Unicité des adresses email ─────────────────────────────────

/**
 * Validates: Requirement 1.3
 *
 * Feature: phone-shop-app, Property 2
 *
 * For any email address already registered, a new registration attempt must be rejected with ConflictException.
 */
describe('Property 2 — Unicité des adresses email', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = buildAuthService();
  });

  it('should reject registration for any already-registered email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 50 }),
        // Password always valid (>= 8 chars) so only the email conflict is tested
        fc.string({ minLength: 8, maxLength: 64 }),
        async (email, fullName, password) => {
          // Simulate the email already being in the database
          const existingUser: Partial<User> = {
            id: 'existing-id',
            email: email.toLowerCase(),
            role: UserRole.CLIENT,
            isActive: true,
          };
          mockUserRepository.findOne.mockResolvedValue(existingUser);

          await expect(
            authService.register({ email, fullName, password }),
          ).rejects.toThrow(ConflictException);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 11: Isolation des rôles (backend guard) ───────────────────────

/**
 * Validates: Requirements 1.9, 13.4
 *
 * Feature: phone-shop-app, Property 11
 *
 * For any authenticated user with role CLIENT, any request to an admin route must be rejected (HTTP 403).
 */
describe('Property 11 — Isolation des rôles (backend guard)', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  /**
   * Helper to build a mock ExecutionContext with a given user and required roles.
   */
  function buildContext(userRole: UserRole, requiredRoles: UserRole[]): ExecutionContext {
    const mockRequest = {
      user: { id: 'some-id', email: 'user@example.com', role: userRole },
    };

    const mockHandler = jest.fn();
    const mockClass = jest.fn();

    // Define roles metadata on handler
    Reflect.defineMetadata('roles', requiredRoles, mockHandler);

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => mockHandler,
      getClass: () => mockClass,
    } as unknown as ExecutionContext;
  }

  it('should throw ForbiddenException for CLIENT users on any ADMIN-only route', () => {
    fc.assert(
      fc.property(
        // Any admin route requiring ADMIN role
        fc.constantFrom(UserRole.ADMIN),
        (requiredRole) => {
          const context = buildContext(UserRole.CLIENT, [requiredRole]);

          expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should allow ADMIN users to access admin routes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserRole.ADMIN),
        (requiredRole) => {
          const context = buildContext(UserRole.ADMIN, [requiredRole]);

          expect(() => rolesGuard.canActivate(context)).not.toThrow();
          expect(rolesGuard.canActivate(context)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});
