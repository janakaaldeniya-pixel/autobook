// actions/parts.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPart(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to sign in to list a part.' };

  const splitCsv = (v: FormDataEntryValue | null) =>
    (v as string || '').split(',').map((s) => s.trim()).filter(Boolean);

  const images = splitCsv(formData.get('images'));
  const compatible_makes = splitCsv(formData.get('compatible_makes'));
  const compatible_models = splitCsv(formData.get('compatible_models'));
  const compatible_years = splitCsv(formData.get('compatible_years'))
    .map(Number)
    .filter((n) => !isNaN(n));

  const { data, error } = await supabase
    .from('spare_parts')
    .insert({
      seller_id: user.id,
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      part_number: formData.get('part_number') as string,
      condition: formData.get('condition') as string,
      price: Number(formData.get('price')),
      stock_qty: Number(formData.get('stock_qty')) || 1,
      description: formData.get('description') as string,
      district: formData.get('district') as string,
      images,
      compatible_makes,
      compatible_models,
      compatible_years,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/spare-parts');
  redirect(`/spare-parts/${data.id}`);
}

export async function updatePartStock(partId: string, stock_qty: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const { error } = await supabase
    .from('spare_parts')
    .update({ stock_qty, is_active: stock_qty > 0 })
    .eq('id', partId)
    .eq('seller_id', user.id);

  if (error) return { error: error.message };
  revalidatePath(`/spare-parts/${partId}`);
  revalidatePath('/spare-parts');
  return { success: true };
}

export async function sendPartInquiry(partId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to sign in to contact the seller.' };

  const message = formData.get('message') as string;

  const { error } = await supabase.from('part_inquiries').insert({
    part_id: partId,
    buyer_id: user.id,
    message,
  });
  if (error) return { error: error.message };

  const { data: part } = await supabase
    .from('spare_parts')
    .select('seller_id, name')
    .eq('id', partId)
    .single();

  if (part) {
    await supabase.from('notifications').insert({
      user_id: part.seller_id,
      type: 'part_inquiry',
      title: 'New buyer inquiry',
      message: `Someone is interested in your "${part.name}" listing.`,
      related_id: partId,
    });
  }

  revalidatePath(`/spare-parts/${partId}`);
  return { success: true };
}
