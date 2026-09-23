// components/myservice/VehicleCard.tsx
import Link from 'next/link';
import { Vehicle, ServiceReminder, isOverdue } from '@/lib/myservice-types';

export function VehicleCard({
  vehicle,
  nextReminder,
}: {
  vehicle: Vehicle;
  nextReminder: ServiceReminder | null;
}) {
  const overdue = nextReminder ? isOverdue(nextReminder) : false;

  return (
    <Link
      href={`/my-service/vehicles/${vehicle.id}`}
      className="block rounded-sm border border-[#2B3339] bg-[#1B2023] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-condensed text-xl uppercase leading-tight text-[#F2EFE9]">
            {vehicle.make} {vehicle.model} {vehicle.year ? `'${String(vehicle.year).slice(2)}` : ''}
          </p>
          <p className="mt-1 text-sm text-[#8A9299]">
            {vehicle.plate_number}
            {vehicle.current_mileage ? ` · ${vehicle.current_mileage.toLocaleString()} km` : ''}
          </p>
        </div>
      </div>

      {nextReminder && (
        <div
          className={`mt-3 rounded-sm border px-3 py-2 text-sm ${
            overdue
              ? 'border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]'
              : 'border-[#3A4249] text-[#C7CDD1]'
          }`}
        >
          {overdue ? 'Overdue: ' : 'Next: '}
          {nextReminder.reminder_type}
          {nextReminder.due_date && ` · ${new Date(nextReminder.due_date).toLocaleDateString('en-LK')}`}
        </div>
      )}
    </Link>
  );
}
