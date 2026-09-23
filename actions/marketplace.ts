// actions/marketplace.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to sign in to post a listing.' };

  const imagesRaw = formData.get('images') as string;
  const images = imagesRaw
    ? imagesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const { data, error } = await supabase
    .from('vehicle_listings')
    .insert({
      seller_id: user.id,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: Number(formData.get('year')) || null,
      price: Number(formData.get('price')),
      mileage: Number(formData.get('mileage')) || null,
      condition: formData.get('condition') as string,
      transmission: formData.get('transmission') as string,
      fuel_type: formData.get('fuel_type') as string,
      body_type: formData.get('body_type') as string,
      color: formData.get('color') as string,
      description: formData.get('description') as string,
      district: formData.get('district') as string,
      images,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/buy-sell');
  redirect(`/buy-sell/${data.id}`);
}

export async function updateListingStatus(listingId: string, status: 'sold' | 'active' | 'pending') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.' };

  const { error } = await supabase
    .from('vehicle_listings')
    .update({ status })
    .eq('id', listingId)
    .eq('seller_id', user.id); // RLS also enforces this, belt & suspenders

  if (error) return { error: error.message };
  revalidatePath(`/buy-sell/${listingId}`);
  revalidatePath('/buy-sell');
  return { success: true };
}

export async function sendInquiry(listingId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You need to sign in to contact the seller.' };

  const message = formData.get('message') as string;

  const { error } = await supabase.from('listing_inquiries').insert({
    listing_id: listingId,
    buyer_id: user.id,
    message,
  });
  if (error) return { error: error.message };

  // Notify the seller
  const { data: listing } = await supabase
    .from('vehicle_listings')
    .select('seller_id, make, model')
    .eq('id', listingId)
    .single();

  if (listing) {
    await supabase.from('notifications').insert({
      user_id: listing.seller_id,
      type: 'inquiry',
      title: 'New buyer inquiry',
      message: `Someone is interested in your ${listing.make} ${listing.model}.`,
      related_id: listingId,
    });
  }

  revalidatePath(`/buy-sell/${listingId}`);
  return { success: true };
}

export async function toggleFavorite(itemId: string, itemType: 'vehicle_listing' | 'spare_part' | 'garage') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in required.', favorited: false };

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    revalidatePath('/buy-sell');
    return { favorited: false };
  } else {
    await supabase.from('favorites').insert({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
    });
    revalidatePath('/buy-sell');
    return { favorited: true };
  }
}
