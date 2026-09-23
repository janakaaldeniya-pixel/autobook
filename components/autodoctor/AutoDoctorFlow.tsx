// components/autodoctor/AutoDoctorFlow.tsx
'use client';

import { useState, useTransition } from 'react';
import { Symptom, DiagnosisResult } from '@/lib/autodoctor-types';
import { SymptomPicker } from './SymptomPicker';
import { ResultsList } from './ResultsList';
import { runDiagnosis } from '@/actions/autodoctor';

export function AutoDoctorFlow({ symptoms }: { symptoms: Symptom[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'select' | 'results'>('select');
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function diagnose() {
    setError(null);
    startTransition(async () => {
      const result = await runDiagnosis(Array.from(selected));
      if (result.error) {
        setError(result.error);
        return;
      }
      setResults(result.results ?? []);
      setStep('results');
    });
  }

  function startOver() {
    setSelected(new Set());
    setResults([]);
    setStep('select');
  }

  if (step === 'results') {
    return (
      <div>
        <button
          onClick={startOver}
          className="mb-6 text-sm text-[#8A9299] hover:text-[#E2662D]"
        >
          ← Start over
        </button>
        <ResultsList results={results} />
      </div>
    );
  }

  return (
    <div>
      <SymptomPicker symptoms={symptoms} selected={selected} onToggle={toggle} />

      <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-3 rounded-sm border border-[#2B3339] bg-[#1B2023] p-3">
        <span className="text-sm text-[#8A9299]">
          {selected.size} symptom{selected.size === 1 ? '' : 's'} selected
        </span>
        <button
          onClick={diagnose}
          disabled={selected.size === 0 || isPending}
          className="rounded-sm bg-[#E2662D] px-5 py-2.5 text-sm font-medium text-[#14181A] disabled:opacity-40"
        >
          {isPending ? 'Diagnosing…' : 'Get diagnosis'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
