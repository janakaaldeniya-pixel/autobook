// app/garages/new/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createGarage } from '@/actions/garages';
import { SRI_LANKA_DISTRICTS, COMMON_SERVICES } from '@/lib/types';

export default async function NewGaragePage() {
  // Garage owners sign up/log in through the same Autobook login as everyone
  // else — there's no separate "garage account" type. This just gates the
  // form behind that existing session and sends anonymous visitors to log in
  // first, then back here.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/garages/new');
  }

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-lg px-6 py-10">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          List your garage
        </h1>
        <p className="mt-2 text-sm text-[#8A9299]">
          Get discovered by drivers searching your district. Free to list.
        </p>

        <form action={createGarage} className="mt-8 space-y-5">
          <Field label="Garage name" name="name" required />
          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
            />
          </div>
          <Field label="Address" name="address" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-[#C7CDD1]">District</label>
              <select
                name="district"
                required
                className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
              >
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <Field label="City / Town" name="city" />
          </div>
          <Field label="Phone number" name="phone" type="tel" required />
          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">
              Services offered (comma separated)
            </label>
            <input
              name="services_offered"
              placeholder={COMMON_SERVICES.slice(0, 3).join(', ')}
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A]"
          >
            List my garage
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
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
