export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleCreate {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string;
}

export interface ArticleUpdate extends ArticleCreate {
  id: number;
}
