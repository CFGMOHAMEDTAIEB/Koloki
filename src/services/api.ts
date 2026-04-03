// API Client for Coloki Backend with Enhanced Security
import { SecureStorage, RateLimiter, createSecureHeaders, ValidationUtils } from '../utils/security';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Enhanced API Client with Security Features:
 * - CSRF Protection
 * - Rate Limiting
 * - Secure Headers
 * - Token Management
 * - Request Validation
 * - Error Handling
 * - Automatic Token Refresh
 */
export class ColokiAPI {
  private static csrfToken: string | null = null;
  private static refreshToken: string | null = null;

  /**
   * Initialize CSRF token
   */
  static async initializeCSRF(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      this.csrfToken = data.csrfToken;
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
    }
  }

  /**
   * Validate input before sending
   */
  private static validateInput(data: any): boolean {
    if (typeof data === 'string') {
      if (data.length > 10000) {
        throw new Error('Input exceeds maximum length');
      }
      // Validate email if it looks like email
      if (data.includes('@') && !ValidationUtils.isValidEmail(data)) {
        throw new Error('Invalid email format');
      }
    }
    return true;
  }

  /**
   * Refresh access token using refresh token
   */
  private static async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = SecureStorage.getSensitive('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });

      if (!response.ok) {
        // Token refresh failed, logout user
        this.logout();
        throw new Error('Token expired, please login again');
      }

      const data = await response.json();
      SecureStorage.setSensitive('accessToken', data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Core request method with security features
   */
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Rate limiting
    const key = `${options.method || 'GET'}-${endpoint}`;
    if (!rateLimiter.isAllowed(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Validate input
    if (options.body) {
      try {
        const bodyData = JSON.parse(options.body as string);
        this.validateInput(bodyData);
      } catch (error) {
        throw new Error('Invalid request data');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    let token = SecureStorage.getSensitive('accessToken');

    // Use temporary token for CSRF initialization
    if (!this.csrfToken && endpoint !== '/csrf-token') {
      await this.initializeCSRF();
    }

    const headers = {
      ...createSecureHeaders(token),
      ...options.headers,
      ...(this.csrfToken ? { 'X-CSRF-Token': this.csrfToken } : {}),
    };

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Include cookies for cookie-based session
      });

      // Handle token expiration - try to refresh
      if (response.status === 401) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include'
          });
        } else {
          // Refresh failed, redirect to login
          this.logout();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      
      // Log security errors
      if (error.message?.includes('Rate limit') || 
          error.message?.includes('CSRF') ||
          error.message?.includes('Authentication')) {
        console.warn('Security-related API error:', error);
      }
      
      throw error;
    }
  }

  /**
   * Store tokens securely
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    SecureStorage.setSensitive('accessToken', accessToken);
    SecureStorage.setSensitive('refreshToken', refreshToken);
  }

  /**
   * Logout and clear sensitive data
   */
  static logout(): void {
    SecureStorage.removeSensitive('accessToken');
    SecureStorage.removeSensitive('refreshToken');
    SecureStorage.clear();
    this.csrfToken = null;
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return SecureStorage.getSensitive('accessToken');
  }

  // ========== Auth Endpoints ==========

  static async login(email: string, password: string): Promise<any> {
    // Validate email
    if (!ValidationUtils.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    return this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }

  static async signup(data: any): Promise<any> {
    // Validate inputs
    if (!ValidationUtils.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    if (!ValidationUtils.isValidPhone(data.phone)) {
      throw new Error('Invalid phone format');
    }

    return this.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  static async refreshToken(): Promise<any> {
    const refreshToken = SecureStorage.getSensitive('refreshToken');
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  }

  // ========== Property Endpoints ==========

  static async getProperties(filters?: any): Promise<any> {
    const query = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        query.append(key, filters[key]);
      });
    }
    return this.request(`/properties?${query.toString()}`);
  }

  static async getProperty(id: string): Promise<any> {
    return this.request(`/properties/${id}`);
  }

  static async createProperty(data: any): Promise<any> {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateProperty(id: string, data: any): Promise<any> {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async deleteProperty(id: string): Promise<any> {
    return this.request(`/properties/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== Booking Endpoints ==========

  static async createBooking(data: any): Promise<any> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getBookings(): Promise<any> {
    return this.request('/bookings');
  }

  static async updateBooking(id: string, data: any): Promise<any> {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ========== Message Endpoints ==========

  static async sendMessage(data: any): Promise<any> {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getMessages(): Promise<any> {
    return this.request('/messages');
  }

  // ========== Review Endpoints ==========

  static async createReview(data: any): Promise<any> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getReviews(propertyId: string): Promise<any> {
    return this.request(`/reviews?propertyId=${propertyId}`);
  }

  // ========== Payment Endpoints ==========

  static async createPayment(data: any): Promise<any> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getPayments(): Promise<any> {
    return this.request('/payments');
  }
}
  static async register(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'renter' | 'owner';
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  static async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  // Properties Endpoints
  static async listProperties(page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    return this.request(`/properties?${params}`, { method: 'GET' });
  }

  static async getProperty(propertyId: string) {
    return this.request(`/properties/${propertyId}`, { method: 'GET' });
  }

  static async createListing(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async updateListing(propertyId: string, data: any) {
    return this.request(`/properties/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Payment Endpoints
  static async createListingFeePaymentIntent(propertyId: string, amount: number) {
    return this.request('/payments/listing-fee', {
      method: 'POST',
      body: JSON.stringify({ propertyId, amount })
    });
  }

  static async confirmListingFeePayment(propertyId: string, paymentIntentId: string) {
    return this.request('/payments/listing-fee/confirm', {
      method: 'POST',
      body: JSON.stringify({ propertyId, paymentIntentId })
    });
  }

  static async recordCommission(colocationId: string, ownerUserId: string, totalAmount: number) {
    return this.request('/payments/commission', {
      method: 'POST',
      body: JSON.stringify({ colocationId, ownerUserId, totalAmount })
    });
  }

  static async getTransactionHistory(userId: string) {
    return this.request(`/payments/history/${userId}`, { method: 'GET' });
  }

  // User Endpoints
  static async getUserProfile(userId: string) {
    return this.request(`/users/${userId}`, { method: 'GET' });
  }

  static async updateUserProfile(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async startKYCVerification(userId: string, data: any) {
    return this.request(`/users/${userId}/kyc-verify`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Verification Endpoints
  static async getPendingVerifications() {
    return this.request('/verification/pending', { method: 'GET' });
  }

  static async approveUser(userId: string) {
    return this.request(`/verification/${userId}/approve`, {
      method: 'POST'
    });
  }

  // Advertising Endpoints
  static async getAdvertisements() {
    return this.request('/advertising', { method: 'GET' });
  }

  static async createAdvertisement(data: any) {
    return this.request('/advertising', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async trackAdImpression(adId: string) {
    return this.request(`/advertising/${adId}/impression`, {
      method: 'POST'
    });
  }

  static async trackAdClick(adId: string) {
    return this.request(`/advertising/${adId}/click`, {
      method: 'POST'
    });
  }
}

export default ColokiAPI;
