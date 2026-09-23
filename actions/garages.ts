// actions/garages.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createGarage(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You need to sign in to list a garage.' };
  }

  const services = (formData.get('services_offered') as string)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from('garages')
    .insert({
      owner_id: user.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      district: formData.get('district') as string,
      city: formData.get('city') as string,
      phone: formData.get('phone') as string,
      services_offered: services,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/garages');
  redirect(`/garages/${data.id}`);
}

export async function submitReview(garageId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You need to sign in to leave a review.' };
  }

  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment') as string;

  const { error } = await supabase.from('garage_reviews').insert({
    garage_id: garageId,
    user_id: user.id,
    rating,
    comment,
  });

  if (error) {
    return { error: error.message };
  }

  // Recalculate the garage's average rating and count.
  const { data: reviews } = await supabase
    .from('garage_reviews')
    .select('rating')
    .eq('garage_id', garageId);

  if (reviews && reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from('garages')
      .update({ rating_avg: Number(avg.toFixed(1)), rating_count: reviews.length })
      .eq('id', garageId);
  }

  revalidatePath(`/garages/${garageId}`);
  return { success: true };
}
