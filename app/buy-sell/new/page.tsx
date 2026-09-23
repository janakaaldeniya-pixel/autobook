// app/buy-sell/new/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createListing } from '@/actions/marketplace';
import {
  VEHICLE_MAKES, BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, CONDITIONS,
} from '@/lib/marketplace-types';
import { SRI_LANKA_DISTRICTS } from '@/lib/types';
import { ImageUploader } from '@/components/marketplace/ImageUploader';

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/buy-sell/new');

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-lg px-6 py-10">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          Post a listing
        </h1>
        <p className="mt-2 text-sm text-[#8A9299]">
          Deal directly with buyers — no commission.
        </p>

        <form action={createListing} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Make" name="make" options={VEHICLE_MAKES} required />
            <Field label="Model" name="model" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" name="year" type="number" />
            <Field label="Price (Rs.)" name="price" type="number" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mileage (km)" name="mileage" type="number" />
            <Select label="Condition" name="condition" options={CONDITIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Transmission" name="transmission" options={TRANSMISSIONS} />
            <Select label="Fuel type" name="fuel_type" options={FUEL_TYPES} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Body type" name="body_type" options={BODY_TYPES} />
            <Field label="Color" name="color" />
          </div>
          <Select label="District" name="district" options={SRI_LANKA_DISTRICTS} required />

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Service history, condition, reason for selling…"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <ImageUploader name="images" />

          <button
            type="submit"
            className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A]"
          >
            Post listing
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, name, type = 'text', required = false,
}: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-[#C7CDD1]">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
      />
    </div>
  );
}

function Select({
  label, name, options, required = false,
}: { label: string; name: string; options: readonly string[]; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-[#C7CDD1]">{label}</label>
      <select
        name={name}
        required={required}
        className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
