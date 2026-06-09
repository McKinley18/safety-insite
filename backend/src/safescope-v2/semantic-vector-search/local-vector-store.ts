import { VectorDocument, VectorSearchResult } from './semantic-vector-search.types';

export class LocalVectorStore {
  private documents: VectorDocument[] = [];
  private vocabulary: Set<string> = new Set();
  private idfMap: Map<string, number> = new Map();
  private docVectors: Map<string, number[]> = new Map();

  constructor() {}

  /**
   * Adds and indexes documents in the vector store
   */
  public addDocuments(docs: VectorDocument[]): void {
    this.documents.push(...docs);
    this.rebuildIndex();
  }

  /**
   * Clears the index and all documents
   */
  public clear(): void {
    this.documents = [];
    this.vocabulary.clear();
    this.idfMap.clear();
    this.docVectors.clear();
  }

  /**
   * Tokenizes and cleans a string into a clean list of lower-case terms
   */
  private tokenize(text: string): string[] {
    if (!text) return [];
    
    // Normalize punctuation and lower case
    const cleaned = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const unigrams = cleaned.split(' ').filter(word => word.length > 2);
    
    // Stem unigrams by stripping common suffixes for plurals, gerunds, etc.
    const stemmedUnigrams = unigrams.map(word => {
      if (word.length <= 3) return word;
      let stemmed = word;
      if (stemmed.endsWith('s') && !stemmed.endsWith('ss')) stemmed = stemmed.slice(0, -1);
      if (stemmed.endsWith('ing')) stemmed = stemmed.slice(0, -3);
      if (stemmed.endsWith('ed')) stemmed = stemmed.slice(0, -2);
      if (stemmed.endsWith('ly')) stemmed = stemmed.slice(0, -2);
      return stemmed;
    });

    // Extract bigrams for phrase matching support
    const bigrams: string[] = [];
    for (let i = 0; i < stemmedUnigrams.length - 1; i++) {
      bigrams.push(`${stemmedUnigrams[i]}_${stemmedUnigrams[i + 1]}`);
    }
    
    return [...stemmedUnigrams, ...bigrams];
  }

  /**
   * Rebuilds the TF-IDF index across all registered documents
   */
  private rebuildIndex(): void {
    this.vocabulary.clear();
    this.idfMap.clear();
    this.docVectors.clear();

    const N = this.documents.length;
    if (N === 0) return;

    // 1. Build Vocabulary and Document Frequency (DF) counts
    const dfMap: Map<string, number> = new Map();
    const docTokenizedList: { docId: string; tokens: string[]; tfMap: Map<string, number> }[] = [];

    for (const doc of this.documents) {
      const tokens = this.tokenize(doc.text);
      const tfMap: Map<string, number> = new Map();
      const uniqueTokensInDoc = new Set(tokens);

      tokens.forEach(token => {
        tfMap.set(token, (tfMap.get(token) || 0) + 1);
        this.vocabulary.add(token);
      });

      uniqueTokensInDoc.forEach(token => {
        dfMap.set(token, (dfMap.get(token) || 0) + 1);
      });

      docTokenizedList.push({ docId: doc.id, tokens, tfMap });
    }

    // Convert Set vocabulary to a fixed-index array
    const vocabArray = Array.from(this.vocabulary);

    // 2. Compute Inverse Document Frequency (IDF) for each word
    dfMap.forEach((df, term) => {
      // Standard IDF formula: ln( (1 + N) / (1 + df) ) + 1
      const idf = Math.log((1 + N) / (1 + df)) + 1;
      this.idfMap.set(term, idf);
    });

    // 3. Vectorize and L2-Normalize each document
    for (const item of docTokenizedList) {
      const rawVector = vocabArray.map(term => {
        const tf = item.tfMap.get(term) || 0;
        const idf = this.idfMap.get(term) || 0;
        return tf * idf;
      });

      // L2-Normalize the vector
      const l2 = Math.sqrt(rawVector.reduce((sum, val) => sum + val * val, 0));
      const normalizedVector = l2 > 0 ? rawVector.map(val => val / l2) : rawVector;

      this.docVectors.set(item.docId, normalizedVector);
    }
  }

  /**
   * Performs Cosine Similarity vector search across all documents
   */
  public search(query: string, limit: number = 5, minScore: number = 0): VectorSearchResult[] {
    const queryTokens = this.tokenize(query);
    if (!queryTokens.length || this.documents.length === 0) return [];

    const vocabArray = Array.from(this.vocabulary);
    
    // 1. Compute query TF map
    const queryTfMap: Map<string, number> = new Map();
    queryTokens.forEach(token => {
      queryTfMap.set(token, (queryTfMap.get(token) || 0) + 1);
    });

    // 2. Vectorize the query
    const queryRawVector = vocabArray.map(term => {
      // Use query TF and vocabulary IDF
      const tf = queryTfMap.get(term) || 0;
      const idf = this.idfMap.get(term) || 0;
      return tf * idf;
    });

    // 3. L2-Normalize the query vector
    const queryL2 = Math.sqrt(queryRawVector.reduce((sum, val) => sum + val * val, 0));
    const queryNormVector = queryL2 > 0 ? queryRawVector.map(val => val / queryL2) : queryRawVector;

    // 4. Compute Cosine Similarity against all documents (dot product of L2-normalized vectors)
    const results: VectorSearchResult[] = [];

    this.docVectors.forEach((docNormVector, docId) => {
      let score = 0;
      for (let i = 0; i < vocabArray.length; i++) {
        score += queryNormVector[i] * docNormVector[i];
      }

      if (score >= minScore) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc) {
          results.push({
            id: doc.id,
            text: doc.text,
            score: Number(score.toFixed(4)),
            metadata: doc.metadata
          });
        }
      }
    });

    // Sort descending by score
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
