// lib/types.ts

export interface Garage {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  services_offered: string[];
  opening_hours: Record<string, string> | null;
  images: string[];
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface GarageReview {
  id: string;
  garage_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

// The 25 districts of Sri Lanka — used to build the filter list.
export const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle',
] as const;

export const COMMON_SERVICES = [
  'Full Service', 'Oil Change', 'Tyres', 'Brakes', 'AC Repair',
  'Battery', 'Electrical', 'Body & Paint', 'Wheel Alignment',
  'Engine Repair', 'Insurance Claims', 'Vehicle Inspection',
] as const;
