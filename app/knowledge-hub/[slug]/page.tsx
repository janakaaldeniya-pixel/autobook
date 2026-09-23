// app/knowledge-hub/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { createClient } from '@/lib/supabase/server';
import { CommentForm } from '@/components/knowledgehub/CommentForm';
import { ArticleComment, estimateReadMinutes } from '@/lib/knowledgehub-types';

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*, article_categories(name, slug), profiles(full_name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!article) notFound();

  // Fire-and-forget view count bump — don't block the page render on it.
  supabase.rpc('increment_article_views', { article_id: article.id }).then(() => {});

  const { data: comments } = await supabase
    .from('article_comments')
    .select('*, profiles(full_name)')
    .eq('article_id', article.id)
    .order('created_at', { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  const contentHtml = DOMPurify.sanitize(await marked.parse(article.content));

  return (
    <div className="min-h-screen bg-[#14181A]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/knowledge-hub" className="text-sm text-[#8A9299] hover:text-[#E2662D]">
          ← Knowledge Hub
        </Link>

        {article.article_categories && (
          <p className="mt-4 text-xs uppercase tracking-wide text-[#E2662D]">
            {article.article_categories.name}
          </p>
        )}
        <h1 className="font-condensed mt-1 text-3xl uppercase leading-tight tracking-wide text-[#F2EFE9] sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-sm text-[#8A9299]">
          {article.profiles?.full_name ? `By ${article.profiles.full_name} · ` : ''}
          {estimateReadMinutes(article.content)} min read · {article.view_count + 1} views
        </p>

        {article.cover_image_url && (
          <div className="mt-6 aspect-[16/9] overflow-hidden rounded-sm bg-[#1B2023]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
          </div>
        )}

        <article
          className="prose-invert mt-8 max-w-none text-[15px] leading-relaxed text-[#C7CDD1] [&_h2]:font-condensed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-[#F2EFE9] [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-[#E2662D] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {article.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <span key={tag} className="rounded-sm border border-[#3A4249] px-2 py-0.5 text-xs text-[#8A9299]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-[#2B3339] pt-6">
          <h2 className="font-condensed text-sm uppercase tracking-[0.15em] text-[#8A9299]">
            Discussion ({comments?.length ?? 0})
          </h2>

          <div className="mt-4 space-y-4">
            {(comments as ArticleComment[] | null)?.map((c) => (
              <div key={c.id} className="border-b border-[#2B3339] pb-3">
                <p className="text-sm font-medium text-[#F2EFE9]">
                  {c.profiles?.full_name ?? 'Autobook user'}
                </p>
                <p className="mt-1 text-sm text-[#C7CDD1]">{c.comment}</p>
              </div>
            ))}
            {comments?.length === 0 && (
              <p className="text-sm text-[#8A9299]">No comments yet — ask the first question.</p>
            )}
          </div>

          <div className="mt-5">
            <CommentForm articleId={article.id} isSignedIn={!!user} />
          </div>
        </div>
      </div>
    </div>
  );
}
