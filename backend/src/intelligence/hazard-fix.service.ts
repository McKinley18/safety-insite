import { Injectable } from '@nestjs/common';
import { HazardFix, HAZARD_FIX_LIBRARY } from './hazard-fix.library';

@Injectable()
export class HazardFixService {
  private readonly library: HazardFix[] = HAZARD_FIX_LIBRARY;

  findByCategory(category: string): HazardFix[] {
    const normalizedCategory = category.toLowerCase().trim();
    return this.library.filter((item) => item.category === normalizedCategory);
  }

  findBestMatch(input: string): HazardFix | null {
    if (!input) return null;
    const normalizedInput = input.toLowerCase().trim();

    // 1. Direct Hazard Name Match (Exact or Includes)
    const directMatch = this.library.find((item) => 
      normalizedInput.includes(item.hazard.toLowerCase()) || 
      item.hazard.toLowerCase().includes(normalizedInput)
    );
    if (directMatch) return directMatch;

    // 2. Category Keyword Match
    const categoryMatch = this.library.find((item) => 
      normalizedInput.includes(item.category)
    );
    if (categoryMatch) return categoryMatch;

    // 3. Fallback: Search within Violation text
    const violationMatch = this.library.find((item) =>
      item.violation.toLowerCase().includes(normalizedInput)
    );
    
    return violationMatch || null;
  }
}
