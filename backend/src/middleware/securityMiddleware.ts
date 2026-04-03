import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * CSRF Protection Middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate CSRF token if not exists
  if (!req.session?.csrfToken) {
    req.session = req.session || {};
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Add token to response headers
  res.setHeader('X-CSRF-Token', req.session.csrfToken);

  // Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Verify CSRF token
  const tokenFromBody = req.body._csrf;
  const tokenFromHeader = req.headers['x-csrf-token'];
  const token = tokenFromBody || tokenFromHeader;

  if (!token || token !== req.session.csrfToken) {
    logger.warn('CSRF token validation failed', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }

  next();
};

/**
 * Input Validation & Sanitization
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (data: any): any => {
    if (typeof data === 'string') {
      // Remove dangerous characters
      return data
        .replace(/[<>]/g, '') // Remove HTML brackets
        .trim();
    }
    if (Array.isArray(data)) {
      return data.map(sanitize);
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return data;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
};

/**
 * SQL Injection Prevention
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bDROP\b.*\bTABLE\b)/gi,
    /(\bDELETE\b.*\bFROM\b)/gi,
    /(\bINSERT\b.*\bINTO\b)/gi,
    /(\bUPDATE\b.*\bSET\b)/gi,
    /(\bEXEC\b.*\()/gi,
    /(--|#|\/\*|\*\/)/g
  ];

  const checkString = (str: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(str));
  };

  const validateData = (data: any): boolean => {
    if (typeof data === 'string') {
      return checkString(data);
    }
    if (Array.isArray(data)) {
      return data.some(validateData);
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(validateData);
    }
    return false;
  };

  if (validateData(req.body) || validateData(req.query)) {
    logger.warn('SQL injection attempt detected', {
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

/**
 * XSS Prevention
 */
export const preventXSS = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  const checkString = (str: string): boolean => {
    return xssPatterns.some(pattern => pattern.test(str));
  };

  const validateData = (data: any): boolean => {
    if (typeof data === 'string') {
      return checkString(data);
    }
    if (Array.isArray(data)) {
      return data.some(validateData);
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(validateData);
    }
    return false;
  };

  if (validateData(req.body) || validateData(req.query)) {
    logger.warn('XSS attempt detected', {
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

/**
 * Request Size Limit & Timeout
 */
export const requestTimeout = (req: Request, res: Response, next: NextFunction) => {
  const timeout = 30000; // 30 seconds
  req.setTimeout(timeout, () => {
    logger.error('Request timeout', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(408).json({ error: 'Request timeout' });
  });

  res.setTimeout(timeout, () => {
    logger.error('Response timeout', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(408).json({ error: 'Response timeout' });
  });

  next();
};

/**
 * IP Whitelist/Blacklist (Optional)
 */
export const ipFiltering = (whitelist?: string[], blacklist?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || '';

    if (blacklist && blacklist.includes(clientIP)) {
      logger.warn('Blocked IP attempt', { ip: clientIP });
      return res.status(403).json({ error: 'Access denied' });
    }

    if (whitelist && !whitelist.includes(clientIP)) {
      logger.warn('Non-whitelisted IP attempt', { ip: clientIP });
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * Audit Logging Middleware
 */
export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log sensitive operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      logger.info('Audit Log', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userId: req.user?.id,
        userAgent: req.get('user-agent')
      });
    }
  });

  next();
};

/**
 * Request Body Size Validation
 */
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length'], 10);
    if (contentLength > maxSize) {
      logger.warn('Request too large', {
        ip: req.ip,
        size: contentLength
      });
      return res.status(413).json({ error: 'Payload too large' });
    }
  }

  next();
};

/**
 * API Key Validation
 */
export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const validKeys = (process.env.VALID_API_KEYS || '').split(',');

  if (!apiKey || !validKeys.includes(apiKey as string)) {
    logger.warn('Invalid API key attempt', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};
