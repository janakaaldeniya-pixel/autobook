// app/spare-parts/new/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createPart } from '@/actions/parts';
import { PART_CATEGORIES, PART_CONDITIONS } from '@/lib/parts-types';
import { VEHICLE_MAKES } from '@/lib/marketplace-types';
import { SRI_LANKA_DISTRICTS } from '@/lib/types';
import { ImageUploader } from '@/components/parts/ImageUploader';

export default async function NewPartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/spare-parts/new');

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-lg px-6 py-10">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          Sell a part
        </h1>
        <p className="mt-2 text-sm text-[#8A9299]">
          List parts you no longer need, or run your parts shop here.
        </p>

        <form action={createPart} className="mt-8 space-y-5">
          <Field label="Part name" name="name" placeholder="e.g. Front brake pads" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" name="brand" />
            <Field label="Part number (optional)" name="part_number" />
          </div>

          <Select label="Category" name="category" options={PART_CATEGORIES} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-[#C7CDD1]">Condition</label>
              <select name="condition" required className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none">
                {PART_CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Field label="Price (Rs.)" name="price" type="number" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity in stock" name="stock_qty" type="number" />
            <Select label="District" name="district" options={SRI_LANKA_DISTRICTS} required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">
              Compatible makes (comma separated)
            </label>
            <input
              name="compatible_makes"
              placeholder={VEHICLE_MAKES.slice(0, 3).join(', ')}
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">
              Compatible models (comma separated, optional)
            </label>
            <input
              name="compatible_models"
              placeholder="Aqua, Vitz, Yaris"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">
              Compatible years (comma separated, optional)
            </label>
            <input
              name="compatible_years"
              placeholder="2012, 2013, 2014"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Condition details, why you're selling, anything a buyer should know…"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <ImageUploader name="images" />

          <button
            type="submit"
            className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A]"
          >
            List this part
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, name, type = 'text', placeholder, required = false,
}: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-[#C7CDD1]">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
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
