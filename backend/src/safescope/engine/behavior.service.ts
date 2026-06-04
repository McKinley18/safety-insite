export class BehaviorService {

  detect(description: string): string[] {
    if (!description) return [];

    const text = description.toLowerCase();
    const behaviors: string[] = [];

    if (text.includes("not wearing") || text.includes("no seatbelt")) {
      behaviors.push("PPE_VIOLATION");
    }

    if (text.includes("missing") || text.includes("no guard")) {
      behaviors.push("MISSING_PROTECTION");
    }

    if (text.includes("improper") || text.includes("unsafe use")) {
      behaviors.push("UNSAFE_BEHAVIOR");
    }

    return behaviors;
  }
}
