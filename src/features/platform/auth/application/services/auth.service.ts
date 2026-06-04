import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../../../../prisma/prisma.service";
import { AuditLogService } from "../../../audit-log/audit-log.service";
import { SignupDto } from "../dto/signup.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthResponseDto } from "../dto/auth-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Register a new user
   */
  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, password, tenant_name, phone_number } = signupDto;

    // Check if user already exists (outside transaction for performance)
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Find admin role outside transaction (read-only, no need to lock)
    const adminRole = await this.prisma.roles.findFirst({
      where: { role_name: { in: ['admin', 'administrator'], mode: 'insensitive' } },
    });

    if (!adminRole) {
      throw new BadRequestException("Admin role not found in system");
    }

    // Hash password before transaction (CPU-intensive, no DB access)
    const hashedPassword = await this.hashPassword(password);

    try {
      // Execute all database writes in a single atomic transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create tenant
        const tenant = await tx.tenants.create({
          data: {
            email: email,
            tenant_name: tenant_name,
            phone_number: phone_number,
          },
        });

        // 2. Create business linked to tenant
        const business = await tx.businesses.create({
          data: {
            business_name: tenant_name,
            tenant_id: tenant.tenant_id,
          },
        });

        // 3. Create user linked to business
        const user = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
            name: tenant_name,
            phone_number: phone_number,
            business_id: business.business_id,
            role_id: adminRole.role_id,
            is_active: true,
            last_password_change: new Date(),
            email_verified: false, // TODO: Implement email verification
            failed_login_attempts: 0,
          },
        });

        return { tenant, business, user };
      });

      // Generate tokens (outside transaction - no DB write risk)
      const tokens = await this.generateTokens({
        user_id: result.user.user_id,
        email: result.user.email,
        name: result.user.name,
        business_id: result.business.business_id,
        tenant_id: result.business.tenant_id,
        role_id: result.user.role_id,
        role_name: adminRole.role_name,
      });
      // Store refresh token (separate operation, can retry if fails)
      await this.updateRefreshToken(result.user.user_id, tokens.refresh_token);

      // Pre-populate cache with is_active = true to prevent race conditions
      const cacheKey = `user:${result.user.user_id}:active`;
      await this.cacheManager.set(cacheKey, true, 300000);

      void this.auditLogService.log({
        business_id: result.business.business_id,
        user_id: result.user.user_id,
        action: 'signup',
        entity_type: 'user',
        entity_id: result.user.user_id,
      });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          user_id: result.user.user_id,
          email: result.user.email,
          name: result.user.name,
          business_id: result.business.business_id,
          role_id: result.user.role_id,
          profile_completed: result.user.profile_completed || false,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Signup failed: ${error.message || "Unknown error"}`
      );
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: {
        businesses: {
          select: {
            business_id: true,
            tenant_id: true,
            business_type: true,
          },
        },
        roles: true,
      },
    });

    // CRITICAL-4: Always use the same message for missing user/password — prevents email enumeration
    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException("Account is inactive");
    }

    // CRITICAL-3: Check lockout BEFORE bcrypt (cheap date check vs expensive hash)
    if (user.account_locked_until && user.account_locked_until > new Date()) {
      const minutesLeft = Math.ceil(
        (user.account_locked_until.getTime() - Date.now()) / 60000
      );
      throw new UnauthorizedException(
        `Account is locked due to multiple failed login attempts. Please try again in ${minutesLeft} minutes.`
      );
    }

    // Verify password (expensive bcrypt — only reached if account is not locked)
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
      await this.prisma.users.update({
        where: { user_id: user.user_id },
        data: {
          failed_login_attempts: newFailedAttempts,
          account_locked_until:
            newFailedAttempts >= 5
              ? new Date(Date.now() + 15 * 60 * 1000)
              : undefined,
        },
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    // Validate business and tenant relationship
    if (!user.businesses || !user.businesses.tenant_id) {
      throw new UnauthorizedException("User business configuration is invalid");
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      business_id: user.business_id,
      tenant_id: user.businesses.tenant_id,
      role_id: user.role_id,
      role_name: user.roles?.role_name ?? '',
    });

    // Store refresh token and update security fields
    await this.updateRefreshToken(user.user_id, tokens.refresh_token);

    // Update last login and reset failed attempts
    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        last_login_at: new Date(),
        failed_login_attempts: 0,
        account_locked_until: null,
      },
    });

    // Pre-populate cache with is_active = true to prevent race conditions
    const cacheKey = `user:${user.user_id}:active`;
    await this.cacheManager.set(cacheKey, true, 300000);

    void this.auditLogService.log({
      business_id: user.business_id,
      user_id: user.user_id,
      action: 'login',
      entity_type: 'user',
      entity_id: user.user_id,
    });

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        business_id: user.business_id,
        role_id: user.role_id,
        profile_completed: user.profile_completed || false,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      // Find user
      const user = await this.prisma.users.findUnique({
      where: { user_id: payload.user_id },
      include: {
        businesses: {
          select: {
            business_id: true,
            tenant_id: true,
            business_type: true,
          },
        },
        roles: true,
        },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Verify stored refresh token matches
      if (!user.refresh_token) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refresh_token
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new tokens
      const tokens = await this.generateTokens({
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        business_id: user.business_id,
        tenant_id: user.businesses.tenant_id,
        role_id: user.role_id,
        role_name: user.roles?.role_name ?? '',
      });

      // Update refresh token
      await this.updateRefreshToken(user.user_id, tokens.refresh_token);

      // Pre-populate cache with is_active = true to prevent race conditions
      const cacheKey = `user:${user.user_id}:active`;
      await this.cacheManager.set(cacheKey, true, 300000);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          business_id: user.business_id,
          role_id: user.role_id,
          profile_completed: user.profile_completed || false,
        },
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Logout user (invalidate refresh token and clear cache)
   */
  async logout(userId: string): Promise<void> {
    const user = await this.prisma.users.update({
      where: { user_id: userId },
      data: { refresh_token: null },
      select: { business_id: true },
    });

    await this.clearUserCache(userId);

    void this.auditLogService.log({
      business_id: user.business_id,
      user_id: userId,
      action: 'logout',
      entity_type: 'user',
      entity_id: userId,
    });
  }

  /**
   * Clear user cache (call this when user status changes)
   */
  private async clearUserCache(userId: string): Promise<void> {
    const cacheKey = `user:${userId}:active`;
    await this.cacheManager.del(cacheKey);
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(payload: {
    user_id: string;
    email: string;
    name: string;
    business_id: string;
    tenant_id: string;
    role_id: string;
    role_name: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    const accessExpiration =
      this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "15m";
    const refreshExpiration =
      this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "7d";

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: accessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshExpiration as any,
      }),
    ]);

    return { access_token, refresh_token };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Update refresh token in database
   */
  private async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { refresh_token: hashedRefreshToken },
    });
  }
}
