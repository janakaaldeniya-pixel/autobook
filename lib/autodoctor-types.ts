// lib/autodoctor-types.ts

export interface Symptom {
  id: string;
  name: string;
  category: string;
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface DiagnosisResult {
  issue_id: string;
  title: string;
  description: string;
  possible_causes: string;
  severity: Severity;
  recommended_action: string;
  category: string;
  matched_weight: number;
  total_weight: number;
  confidence: number; // 0–100
}

export const CATEGORY_LABELS: Record<string, string> = {
  engine: 'Engine',
  brakes: 'Brakes',
  electrical: 'Electrical',
  ac: 'AC & Cooling',
  suspension: 'Suspension & Steering',
  tyres: 'Tyres',
};

export const SEVERITY_STYLES: Record<Severity, { label: string; color: string; bg: string }> = {
  low: { label: 'Low priority', color: '#8FBF8F', bg: 'rgba(143,191,143,0.12)' },
  medium: { label: 'Medium priority', color: '#D9A404', bg: 'rgba(217,164,4,0.12)' },
  high: { label: 'High priority', color: '#E2662D', bg: 'rgba(226,102,45,0.14)' },
  critical: { label: 'Stop & get help', color: '#E5484D', bg: 'rgba(229,72,77,0.16)' },
};
