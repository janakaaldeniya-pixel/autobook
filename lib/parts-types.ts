// lib/parts-types.ts

export type PartCondition = 'new' | 'used' | 'refurbished';

export interface SparePart {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  brand: string | null;
  part_number: string | null;
  compatible_makes: string[];
  compatible_models: string[];
  compatible_years: number[];
  condition: PartCondition;
  price: number;
  stock_qty: number;
  images: string[];
  description: string | null;
  district: string | null;
  is_active: boolean;
  created_at: string;
  profiles?: { full_name: string | null; phone: string | null } | null;
  part_categories?: { name: string } | null;
}

export interface PartInquiry {
  id: string;
  part_id: string;
  buyer_id: string;
  message: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

// Seed data for `part_categories` — insert these once via SQL or the
// Supabase table editor, then this list can be dropped in favor of a
// live query if categories start changing often.
export const PART_CATEGORIES = [
  'Engine & Transmission', 'Brakes', 'Suspension & Steering',
  'Electrical & Battery', 'Body Parts', 'Lights & Mirrors',
  'Tyres & Wheels', 'AC & Cooling', 'Interior', 'Exhaust System',
  'Filters & Fluids', 'Tools & Accessories',
] as const;

export const PART_CONDITIONS: { value: PartCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
];

export const PART_PRICE_RANGES = [
  { label: 'Any price', min: undefined, max: undefined },
  { label: 'Under 5,000', min: undefined, max: 5_000 },
  { label: '5,000 – 20,000', min: 5_000, max: 20_000 },
  { label: '20,000 – 100,000', min: 20_000, max: 100_000 },
  { label: 'Over 100,000', min: 100_000, max: undefined },
] as const;
