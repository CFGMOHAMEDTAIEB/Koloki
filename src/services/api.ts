// API Client for Coloki Backend
import { createSecureHeaders, RateLimiter, createSecureHeaders as getHeaders } from '../utils/security';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

export class ColokiAPI {
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const key = `${options.method || 'GET'}-${endpoint}`;
    
    if (!rateLimiter.isAllowed(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('coloki_token');
    
    const headers = {
      ...getHeaders(token),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('coloki_token');
          window.location.href = '/login';
        }
        
        const error = await response.json();
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth Endpoints
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
