export class KeywordService {
  extract(text: string): string[] {
    if (!text) return [];

    return text
      .toLowerCase()
      .split(/[\s,.-]+/)
      .filter(w => w.length > 3);
  }
}
