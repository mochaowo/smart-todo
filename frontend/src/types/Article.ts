export interface Article {
    id: number;
    title: string;
    content: string;
    summary?: string;
    category?: string;
    created_at: string;
    updated_at: string;
    views: number;
    tags?: string[];
}

export interface ArticleCreate {
    title: string;
    content: string;
    summary?: string;
    category?: string;
    tags?: string;
}

export interface ArticleUpdate {
    title?: string;
    content?: string;
    summary?: string;
    category?: string;
    tags?: string;
}
