// actions/knowledgehub.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function postComment(articleId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in to leave a comment.' };

  const comment = (formData.get('comment') as string)?.trim();
  if (!comment) return { error: 'Comment can\'t be empty.' };

  const { error } = await supabase.from('article_comments').insert({
    article_id: articleId,
    user_id: user.id,
    comment,
  });
  if (error) return { error: error.message };

  revalidatePath(`/knowledge-hub`);
  return { success: true };
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sign in to write an article.' };

  const title = formData.get('title') as string;
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const tags = (formData.get('tags') as string || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from('articles')
    .insert({
      author_id: user.id,
      category_id: formData.get('category_id') as string || null,
      title,
      slug,
      content: formData.get('content') as string,
      cover_image_url: (formData.get('cover_image_url') as string) || null,
      tags,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .select('slug')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/knowledge-hub');
  redirect(`/knowledge-hub/${data.slug}`);
}
