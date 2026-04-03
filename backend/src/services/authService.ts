import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * Secure Authentication Service
 */
export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  private static readonly SALT_ROUNDS = 10;
  
  // Token refresh store (in production, use Redis)
  private static refreshTokenStore: Map<string, any> = new Map();

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('Password hashing failed', { error });
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Password comparison failed', { error });
      return false;
    }
  }

  /**
   * Generate JWT token
   */
  static generateAccessToken(userId: string, role: string = 'user'): string {
    try {
      const payload = {
        id: userId,
        role,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomBytes(16).toString('hex') // JWT ID for tracking
      };

      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRY,
        algorithm: 'HS256'
      });
    } catch (error) {
      logger.error('Token generation failed', { error });
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      this.refreshTokenStore.set(token, {
        userId,
        expiresAt,
        createdAt: new Date()
      });

      return token;
    } catch (error) {
      logger.error('Refresh token generation failed', { error });
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Verify JWT token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      logger.warn('Token verification failed', { error });
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshAccessToken(refreshToken: string): string | null {
    try {
      const tokenData = this.refreshTokenStore.get(refreshToken);

      if (!tokenData) {
        throw new Error('Refresh token not found');
      }

      if (new Date() > tokenData.expiresAt) {
        this.refreshTokenStore.delete(refreshToken);
        throw new Error('Refresh token expired');
      }

      // Generate new access token
      return this.generateAccessToken(tokenData.userId);
    } catch (error) {
      logger.warn('Token refresh failed', { error });
      return null;
    }
  }

  /**
   * Revoke refresh token (logout)
   */
  static revokeRefreshToken(refreshToken: string): boolean {
    try {
      return this.refreshTokenStore.delete(refreshToken);
    } catch (error) {
      logger.error('Token revocation failed', { error });
      return false;
    }
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId: string): string {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Store with expiry (1 hour)
      this.refreshTokenStore.set(hashedToken, {
        userId,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      });

      return token;
    } catch (error) {
      logger.error('Password reset token generation failed', { error });
      throw new Error('Failed to generate reset token');
    }
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): string | null {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const tokenData = this.refreshTokenStore.get(hashedToken);

      if (!tokenData || tokenData.type !== 'password_reset') {
        return null;
      }

      if (new Date() > tokenData.expiresAt) {
        this.refreshTokenStore.delete(hashedToken);
        return null;
      }

      return tokenData.userId;
    } catch (error) {
      logger.error('Password reset token verification failed', { error });
      return null;
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate 2FA code
   */
  static generate2FACode(): string {
    return Math.random().toString().slice(2, 8).padStart(6, '0');
  }

  /**
   * Verify 2FA code
   */
  static verify2FACode(code: string, expectedCode: string): boolean {
    return code === expectedCode;
  }

  /**
   * Clear expired tokens (cleanup)
   */
  static clearExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.refreshTokenStore.entries()) {
      if (data.expiresAt < now) {
        this.refreshTokenStore.delete(token);
      }
    }
  }
}

export default AuthService;
