export interface VectorDocument {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SemanticVectorSearchInput {
  query: string;
  limit?: number;
  minScore?: number;
}
