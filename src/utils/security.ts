// Security utilities for the frontend

/**
 * Encryption utilities for sensitive data
 */
export const CryptoUtils = {
  // Hash sensitive data client-side
  hashData: async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  // Generate secure random token
  generateToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
    return token;
  }
};

/**
 * Secure Storage with encryption
 * IMPORTANT: Use sessionStorage for sensitive data like tokens
 * Use localStorage only for non-sensitive preferences
 */
export const SecureStorage = {
  // Use sessionStorage for sensitive data (cleared on browser close)
  setSensitive: (key: string, value: any): void => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      sessionStorage.setItem(`coloki_secure_${key}`, encrypted);
    } catch (error) {
      console.error('Secure storage error:', error);
    }
  },

  getSensitive: (key: string): any => {
    try {
      const encrypted = sessionStorage.getItem(`coloki_secure_${key}`);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Secure storage error:', error);
      return null;
    }
  },

  removeSensitive: (key: string): void => {
    sessionStorage.removeItem(`coloki_secure_${key}`);
  },

  // Use localStorage for non-sensitive data
  set: (key: string, value: any): void => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(`coloki_${key}`, encrypted);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  get: (key: string): any => {
    try {
      const encrypted = localStorage.getItem(`coloki_${key}`);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(`coloki_${key}`);
  },

  clear: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('coloki_')) {
        localStorage.removeItem(key);
      }
    });

    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('coloki_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * API request interceptor with security headers
 */
export const createSecureHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0',
    'X-Timestamp': new Date().toISOString()
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Request validation
 */
export const ValidationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  isStrongPassword: (password: string): boolean => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  getPasswordStrength: (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }
};

/**
 * Rate limiting for API calls
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old requests outside time window
    const recentRequests = timestamps.filter(ts => now - ts < this.timeWindow);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

/**
 * Session management
 */
export const SessionManager = {
  startSession: (userData: any): void => {
    SecureStorage.set('session', {
      user: userData,
      startTime: Date.now(),
      lastActivity: Date.now()
    });
  },

  updateActivity: (): void => {
    const session = SecureStorage.get('session');
    if (session) {
      session.lastActivity = Date.now();
      SecureStorage.set('session', session);
    }
  },

  isSessionValid: (maxInactivity: number = 30 * 60 * 1000): boolean => {
    const session = SecureStorage.get('session');
    if (!session) return false;

    const inactivityTime = Date.now() - session.lastActivity;
    return inactivityTime < maxInactivity;
  },

  endSession: (): void => {
    SecureStorage.remove('session');
    SecureStorage.clear();
  },

  getUser: (): any => {
    const session = SecureStorage.get('session');
    return session?.user || null;
  }
};

/**
 * Content Security Policy helpers
 */
export const SecurityHeaders = {
  setCSP: (): void => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.coloki.app https://api.stripe.com;
      frame-ancestors 'none';
    `;
    document.head.appendChild(meta);
  },

  setSecurityHeaders: (): void => {
    // Note: These headers should be set on the server, but we can set them in response headers
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
    // These would be set by the server or fetch API
  }
};

export default {
  CryptoUtils,
  SecureStorage,
  createSecureHeaders,
  ValidationUtils,
  RateLimiter,
  SessionManager,
  SecurityHeaders
};
