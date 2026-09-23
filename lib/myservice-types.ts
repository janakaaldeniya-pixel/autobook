// lib/myservice-types.ts

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number | null;
  plate_number: string | null;
  vin: string | null;
  fuel_type: string | null;
  transmission: string | null;
  current_mileage: number | null;
  image_url: string | null;
  created_at: string;
}

export interface ServiceRecord {
  id: string;
  vehicle_id: string;
  garage_id: string | null;
  service_type: string;
  service_date: string;
  mileage_at_service: number | null;
  cost: number | null;
  notes: string | null;
  invoice_url: string | null;
  created_at: string;
  garages?: { name: string } | null;
}

export type ReminderStatus = 'pending' | 'done' | 'dismissed';

export interface ServiceReminder {
  id: string;
  vehicle_id: string;
  reminder_type: string;
  due_date: string | null;
  due_mileage: number | null;
  status: ReminderStatus;
  created_at: string;
}

export const SERVICE_TYPES = [
  'Full Service', 'Oil Change', 'Tyre Replacement', 'Brake Service',
  'AC Service', 'Battery Replacement', 'Wheel Alignment', 'Insurance Claim Repair',
  'Vehicle Inspection', 'Other',
] as const;

export const REMINDER_TYPES = [
  'Next Service', 'Oil Change', 'Insurance Renewal', 'Revenue License Renewal',
  'Emission Test', 'Tyre Replacement', 'Other',
] as const;

export function isOverdue(reminder: ServiceReminder) {
  if (reminder.status !== 'pending') return false;
  if (!reminder.due_date) return false;
  return new Date(reminder.due_date) < new Date();
}
