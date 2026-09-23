// lib/knowledgehub-types.ts

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  slug: string;
  content: string; // markdown
  cover_image_url: string | null;
  tags: string[];
  view_count: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  article_categories?: { name: string; slug: string } | null;
  profiles?: { full_name: string | null } | null;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

// Rough words-per-minute estimate for a "N min read" label.
export function estimateReadMinutes(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
