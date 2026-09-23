// lib/marketplace-types.ts
// If you already have lib/types.ts from the Garage section, you can merge
// these into it instead of keeping a separate file.

export type ListingStatus = 'active' | 'pending' | 'sold' | 'expired';

export interface VehicleListing {
  id: string;
  seller_id: string;
  make: string;
  model: string;
  year: number | null;
  price: number;
  mileage: number | null;
  condition: string | null;
  transmission: string | null;
  fuel_type: string | null;
  body_type: string | null;
  color: string | null;
  images: string[];
  description: string | null;
  district: string | null;
  status: ListingStatus;
  created_at: string;
  profiles?: { full_name: string | null; phone: string | null } | null;
}

export interface ListingInquiry {
  id: string;
  listing_id: string;
  buyer_id: string;
  message: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

export const VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Nissan', 'Suzuki', 'Mitsubishi', 'Perodua',
  'Micro', 'Mazda', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz',
  'Isuzu', 'Tata', 'Mahindra', 'Other',
] as const;

export const BODY_TYPES = [
  'Car', 'Van', 'SUV / Jeep', 'Pickup / Cab', 'Three Wheeler',
  'Motorcycle', 'Bus', 'Lorry', 'Tractor', 'Other',
] as const;

export const TRANSMISSIONS = ['Automatic', 'Manual', 'Tiptronic'] as const;
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
export const CONDITIONS = ['Brand New', 'Used', 'Reconditioned'] as const;

export const PRICE_RANGES = [
  { label: 'Any price', min: undefined, max: undefined },
  { label: 'Under 2M', min: undefined, max: 2_000_000 },
  { label: '2M – 5M', min: 2_000_000, max: 5_000_000 },
  { label: '5M – 10M', min: 5_000_000, max: 10_000_000 },
  { label: 'Over 10M', min: 10_000_000, max: undefined },
] as const;
