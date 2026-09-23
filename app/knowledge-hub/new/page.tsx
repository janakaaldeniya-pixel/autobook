// app/knowledge-hub/new/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createArticle } from '@/actions/knowledgehub';
import { ArticleCategory } from '@/lib/knowledgehub-types';

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/knowledge-hub/new');

  const { data: categories } = await supabase.from('article_categories').select('*').order('name');

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-xl px-6 py-10">
        <p className="font-condensed text-sm uppercase tracking-[0.15em] text-[#E2662D]">
          Autobook
        </p>
        <h1 className="font-condensed mt-1 text-3xl uppercase tracking-wide text-[#F2EFE9]">
          Write an article
        </h1>
        <p className="mt-2 text-sm text-[#8A9299]">
          Share a maintenance tip, buying guide, or repair walkthrough. Markdown supported —
          use <code>##</code> for headings and blank lines between paragraphs.
        </p>

        <form action={createArticle} className="mt-8 space-y-5">
          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Title</label>
            <input
              name="title"
              required
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Category</label>
            <select
              name="category_id"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] focus:border-[#E2662D] focus:outline-none"
            >
              <option value="">No category</option>
              {(categories as ArticleCategory[] | null)?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Cover image URL (optional)</label>
            <input
              name="cover_image_url"
              placeholder="https://…"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Content (Markdown)</label>
            <textarea
              name="content"
              required
              rows={12}
              placeholder={'## Section heading\n\nYour text here…'}
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 font-mono text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#C7CDD1]">Tags (comma separated)</label>
            <input
              name="tags"
              placeholder="engine, maintenance, oil change"
              className="w-full rounded-sm border border-[#3A4249] bg-[#1B2023] px-3 py-2 text-sm text-[#F2EFE9] placeholder:text-[#5C646A] focus:border-[#E2662D] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-sm bg-[#E2662D] px-4 py-2.5 text-sm font-medium text-[#14181A]"
          >
            Publish article
          </button>
        </form>
      </div>
    </div>
  );
}
