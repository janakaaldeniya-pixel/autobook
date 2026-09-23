// components/autodoctor/ResultsList.tsx
import Link from 'next/link';
import { DiagnosisResult, SEVERITY_STYLES } from '@/lib/autodoctor-types';

export function ResultsList({ results }: { results: DiagnosisResult[] }) {
  if (results.length === 0) {
    return (
      <p className="py-10 text-center text-[#8A9299]">
        No close matches for that combination of symptoms yet. Try adding or
        removing a symptom, or describe it to a garage directly.
      </p>
    );
  }

  const hasCritical = results.some((r) => r.severity === 'critical' && r.confidence >= 40);

  return (
    <div>
      {hasCritical && (
        <div className="mb-6 rounded-sm border border-[#E5484D]/40 bg-[#E5484D]/10 p-4">
          <p className="text-sm font-medium text-[#E5484D]">
            One of the likely causes here is safety-critical.
          </p>
          <p className="mt-1 text-sm text-[#C7CDD1]">
            If that applies to what you&apos;re seeing, stop driving and get the
            vehicle inspected before continuing — don&apos;t wait for a
            scheduled service.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((r) => {
          const style = SEVERITY_STYLES[r.severity];
          return (
            <div key={r.issue_id} className="border border-[#2B3339] rounded-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-condensed text-lg uppercase leading-tight text-[#F2EFE9]">
                  {r.title}
                </h3>
                <span
                  className="shrink-0 rounded-sm px-2 py-1 text-[11px] font-medium"
                  style={{ color: style.color, backgroundColor: style.bg }}
                >
                  {style.label}
                </span>
              </div>

              <div className="mt-1 h-1 w-full rounded-full bg-[#2B3339]">
                <div
                  className="h-1 rounded-full bg-[#E2662D]"
                  style={{ width: `${Math.min(100, r.confidence)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-[#8A9299]">{r.confidence}% symptom match</p>

              <p className="mt-3 text-sm text-[#C7CDD1]">{r.description}</p>

              <p className="mt-3 text-xs uppercase tracking-wide text-[#8A9299]">Likely causes</p>
              <p className="text-sm text-[#C7CDD1]">{r.possible_causes}</p>

              <p className="mt-3 text-xs uppercase tracking-wide text-[#8A9299]">What to do</p>
              <p className="text-sm text-[#C7CDD1]">{r.recommended_action}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/garages"
                  className="rounded-sm border border-[#3A4249] px-3 py-1.5 text-xs text-[#C7CDD1] hover:border-[#E2662D]"
                >
                  Find a nearby garage
                </Link>
                <Link
                  href={`/spare-parts?q=${encodeURIComponent(r.title)}`}
                  className="rounded-sm border border-[#3A4249] px-3 py-1.5 text-xs text-[#C7CDD1] hover:border-[#E2662D]"
                >
                  Find related parts
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#5C646A]">
        Auto Doctor gives a starting point based on reported symptoms — it
        isn&apos;t a substitute for an in-person inspection. When in doubt,
        get it checked by a mechanic.
      </p>
    </div>
  );
}
