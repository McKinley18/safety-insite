import { Standard } from './entities/standard.entity';
import { StandardInput } from './types/standard-input.type';

export class StandardMapper {
  static toEntity(input: StandardInput): Partial<Standard> {
    return {
      agencyCode: input.authority as any, // Authority maps to AgencyCode
      citation: input.citation,
      title: input.title,
      standardText: input.description,
      isActive: input.isActive ?? true,
    };
  }
}
