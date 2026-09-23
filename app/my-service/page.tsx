// app/my-service/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VehicleCard } from '@/components/myservice/VehicleCard';
import { Vehicle, ServiceReminder } from '@/lib/myservice-types';

export default async function MyServicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/my-service');

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch the earliest pending reminder for each vehicle in one query.
  const vehicleIds = (vehicles ?? []).map((v) => v.id);
  let remindersByVehicle: Record<string, ServiceReminder> = {};
  if (vehicleIds.length > 0) {
    const { data: reminders } = await supabase
      .from('service_reminders')
      .select('*')
      .in('vehicle_id', vehicleIds)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    for (const r of reminders ?? []) {
      if (!remindersByVehicle[r.vehicle_id]) remindersByVehicle[r.vehicle_id] = r as ServiceReminder;
    }
  }

  return (
    <div className="min-h-screen bg-[#14181A]">
      <header className="border-b border-[#2B3339] px-6 py-8">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-4xl uppercase tracking-wide text-[#F2EFE9]">
          My Service
        </h1>
        <p className="mt-2 max-w-xl text-[#8A9299]">
          Your vehicles, service history, and upcoming reminders in one place.
        </p>
        <Link
          href="/my-service/vehicles/new"
          className="mt-4 inline-block rounded-sm bg-[#E2662D] px-4 py-2 text-sm font-medium text-[#14181A]"
        >
          Add a vehicle
        </Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {error && <p className="text-red-400">Couldn&apos;t load vehicles: {error.message}</p>}

        {!error && vehicles?.length === 0 && (
          <p className="py-10 text-center text-[#8A9299]">
            No vehicles added yet.{' '}
            <Link href="/my-service/vehicles/new" className="text-[#E2662D] underline">
              Add your first one
            </Link>
            .
          </p>
        )}

        <div className="space-y-3">
          {(vehicles as Vehicle[] | null)?.map((v) => (
            <VehicleCard key={v.id} vehicle={v} nextReminder={remindersByVehicle[v.id] ?? null} />
          ))}
        </div>
      </div>
    </div>
  );
}
