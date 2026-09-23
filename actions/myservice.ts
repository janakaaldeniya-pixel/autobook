// actions/myservice.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createVehicle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      owner_id: user.id,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: Number(formData.get('year')) || null,
      plate_number: formData.get('plate_number') as string,
      fuel_type: formData.get('fuel_type') as string,
      transmission: formData.get('transmission') as string,
      current_mileage: Number(formData.get('current_mileage')) || null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/my-service');
  redirect(`/my-service/vehicles/${data.id}`);
}

export async function updateMileage(vehicleId: string, mileage: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const { error } = await supabase
    .from('vehicles')
    .update({ current_mileage: mileage })
    .eq('id', vehicleId)
    .eq('owner_id', user.id);

  if (error) return { error: error.message };
  revalidatePath(`/my-service/vehicles/${vehicleId}`);
  return { success: true };
}

export async function addServiceRecord(vehicleId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const mileage = Number(formData.get('mileage_at_service')) || null;

  const { error } = await supabase.from('service_records').insert({
    vehicle_id: vehicleId,
    service_type: formData.get('service_type') as string,
    service_date: formData.get('service_date') as string,
    mileage_at_service: mileage,
    cost: Number(formData.get('cost')) || null,
    notes: formData.get('notes') as string,
  });

  if (error) return { error: error.message };

  // Keep the vehicle's current_mileage in sync if this reading is newer.
  if (mileage) {
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('current_mileage')
      .eq('id', vehicleId)
      .single();
    if (vehicle && (vehicle.current_mileage ?? 0) < mileage) {
      await supabase.from('vehicles').update({ current_mileage: mileage }).eq('id', vehicleId);
    }
  }

  revalidatePath(`/my-service/vehicles/${vehicleId}`);
  return { success: true };
}

export async function addReminder(vehicleId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const { error } = await supabase.from('service_reminders').insert({
    vehicle_id: vehicleId,
    reminder_type: formData.get('reminder_type') as string,
    due_date: (formData.get('due_date') as string) || null,
    due_mileage: Number(formData.get('due_mileage')) || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/my-service/vehicles/${vehicleId}`);
  return { success: true };
}

export async function updateReminderStatus(
  reminderId: string,
  vehicleId: string,
  status: 'done' | 'dismissed' | 'pending'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const { error } = await supabase
    .from('service_reminders')
    .update({ status })
    .eq('id', reminderId);

  if (error) return { error: error.message };
  revalidatePath(`/my-service/vehicles/${vehicleId}`);
  revalidatePath('/my-service');
  return { success: true };
}
