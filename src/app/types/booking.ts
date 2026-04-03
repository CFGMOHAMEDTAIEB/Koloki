// Booking and Contract types
export interface BookingContract {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed';
  terms: string[];
  createdAt: Date;
  acceptedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  propertyId?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'inquiry' | 'offer';
}

export interface Review {
  id: string;
  propertyId: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  comment: string;
  categories: {
    cleanliness: number;
    communication: number;
    accuracy: number;
    value: number;
  };
  createdAt: Date;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: {
    cities: string[];
    priceMin: number;
    priceMax: number;
    bedrooms: number;
    amenities: string[];
  };
  createdAt: Date;
  alerts: boolean;
}
