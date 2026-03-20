export interface Source {
  title: string;
  url: string;
  source: string;
  date: string;
  score: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  query: string;
  chunks_used: number;
}

export interface PopularQuestion {
  question: string;
  total_asks: number;
  source_type: string | null;
  cached_at: string;
}
