// actions/autodoctor.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { DiagnosisResult } from '@/lib/autodoctor-types';

export async function runDiagnosis(symptomIds: string[], vehicleId?: string) {
  if (symptomIds.length === 0) {
    return { error: 'Select at least one symptom.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('diagnose_issues', {
    symptom_ids: symptomIds,
  });

  if (error) return { error: error.message };

  const results = (data ?? []) as DiagnosisResult[];

  // Diagnosis works for guests too — only logged-in users get their
  // session saved (so it can show up in "My Service" history later).
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('diagnostic_sessions').insert({
      user_id: user.id,
      vehicle_id: vehicleId ?? null,
      selected_symptom_ids: symptomIds,
      suggested_issue_ids: results.map((r) => r.issue_id),
    });
  }

  return { results };
}
