// app/my-service/vehicles/new/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createVehicle } from '@/actions/myservice';

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/my-service/vehicles/new');

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-lg px-6 py-10">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          Add a vehicle
        </h1>

        <form action={createVehicle} className="mt-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Make" name="make" required />
            <Field label="Model" name="model" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" name="year" type="number" />
            <Field label="Plate number" name="plate_number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-[#C7CDD1]">Transmission</label>
              <select name="transmission" className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none">
                <option value="">Select…</option>
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-[#C7CDD1]">Fuel type</label>
              <select name="fuel_type" className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none">
                <option value="">Select…</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </div>
          </div>
          <Field label="Current mileage (km)" name="current_mileage" type="number" />

          <button
            type="submit"
            className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A]"
          >
            Add vehicle
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
