// app/my-service/vehicles/[id]/page.tsx
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MileageControl } from '@/components/myservice/MileageControl';
import { ServiceHistory } from '@/components/myservice/ServiceHistory';
import { Reminders } from '@/components/myservice/Reminders';
import { ServiceRecord, ServiceReminder } from '@/lib/myservice-types';

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/my-service/vehicles/${id}`);

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id) // scope to the owner — also enforced by RLS
    .single();

  if (!vehicle) notFound();

  const { data: records } = await supabase
    .from('service_records')
    .select('*, garages(name)')
    .eq('vehicle_id', id)
    .order('service_date', { ascending: false });

  const { data: reminders } = await supabase
    .from('service_reminders')
    .select('*')
    .eq('vehicle_id', id)
    .order('due_date', { ascending: true });

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/my-service" className="text-sm text-[#8A9299] hover:text-[#E2662D]">
          ← My vehicles
        </Link>

        <h1 className="font-condensed mt-4 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          {vehicle.make} {vehicle.model} {vehicle.year ?? ''}
        </h1>
        <p className="mt-1 text-sm text-[#8A9299]">{vehicle.plate_number}</p>

        <div className="mt-4 flex flex-wrap items-center gap-6 border-y border-[#2B3339] py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8A9299]">Mileage</p>
            <div className="mt-1">
              <MileageControl vehicleId={vehicle.id} currentMileage={vehicle.current_mileage} />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8A9299]">Transmission</p>
            <p className="mt-1 text-sm text-[#C7CDD1]">{vehicle.transmission ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8A9299]">Fuel</p>
            <p className="mt-1 text-sm text-[#C7CDD1]">{vehicle.fuel_type ?? '—'}</p>
          </div>
        </div>

        <div className="mt-8">
          <Reminders vehicleId={vehicle.id} reminders={(reminders as ServiceReminder[]) ?? []} />
        </div>

        <div className="mt-10">
          <ServiceHistory vehicleId={vehicle.id} records={(records as ServiceRecord[]) ?? []} />
        </div>
      </div>
    </div>
  );
}
