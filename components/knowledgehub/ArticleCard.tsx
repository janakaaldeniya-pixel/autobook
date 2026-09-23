// components/knowledgehub/ArticleCard.tsx
import Link from 'next/link';
import { Article, estimateReadMinutes } from '@/lib/knowledgehub-types';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/knowledge-hub/${article.slug}`}
      className="group block overflow-hidden rounded-sm border border-[#2B3339] bg-[#1B2023]"
    >
      <div className="aspect-[16/9] bg-[#0F1214]">
        {article.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.cover_image_url} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#5C646A]">
            Autobook
          </div>
        )}
      </div>
      <div className="p-4">
        {article.article_categories && (
          <p className="text-xs uppercase tracking-wide text-[#E2662D]">
            {article.article_categories.name}
          </p>
        )}
        <h3 className="font-condensed mt-1 text-lg uppercase leading-tight text-[#F2EFE9] group-hover:text-[#E2662D]">
          {article.title}
        </h3>
        <p className="mt-2 text-xs text-[#8A9299]">
          {estimateReadMinutes(article.content)} min read · {article.view_count} views
        </p>
      </div>
    </Link>
  );
}
