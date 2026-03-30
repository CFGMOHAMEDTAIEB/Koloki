export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  availableRooms: number;
  totalRooms: number;
  availableFrom: string;
  amenities: string[];
  description: string;
  housemates: {
    current: number;
    total: number;
  };
  utilities: string;
  rules: string[];
  location: {
    lat: number;
    lng: number;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  availabilitySchedule: {
    day: string;
    slots: string[];
  }[];
  paymentOptions: string[];
}

export interface User {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  preferences: {
    budget: { min: number; max: number };
    moveInDate: string;
    preferredCities: string[];
    lifestyle: string[];
  };
}