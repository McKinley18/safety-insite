import * as natural from 'natural';
import { Injectable } from '@nestjs/common';
import { 
  SemanticSynonymExpansionInput, 
  SemanticSynonymExpansionResult 
} from './semantic-synonym-expansion.types';

interface SynonymGroup {
  family: string;
  canonical: string;
  synonyms: string[];
}

@Injectable()
export class SemanticSynonymExpansionService {
  private synonymGroups: SynonymGroup[] = [
    {
      family: 'machine_guarding',
      canonical: 'nip_point',
      synonyms: ['pinch point', 'nip point', 'in-running nip', 'draw-in', 'in-running nip point']
    },
    {
      family: 'machine_guarding',
      canonical: 'caught_in',
      synonyms: ['caught-in', 'caught between', 'entanglement', 'caught in']
    },
    {
      family: 'machine_guarding',
      canonical: 'rotating_parts',
      synonyms: ['rotating parts', 'moving parts', 'rotating shaft']
    },
    {
      family: 'lockout_tagout',
      canonical: 'energized',
      synonyms: ['energized', 'live', 'power on', 'running', 'started', 'power still on']
    },
    {
      family: 'lockout_tagout',
      canonical: 'not_isolated',
      synonyms: ['not isolated', 'not locked out', 'no lock', 'no loto', 'no lock applied']
    },
    {
      family: 'lockout_tagout',
      canonical: 'unexpected_startup',
      synonyms: ['unexpected startup', 'stored energy']
    },
    {
      family: 'electrical',
      canonical: 'exposed_wire',
      synonyms: ['exposed wire', 'frayed cord', 'damaged cord', 'live conductor', 'frayed extension cord']
    },
    {
      family: 'electrical',
      canonical: 'open_panel',
      synonyms: ['open panel', 'missing cover']
    },
    {
      family: 'slips_trips_falls',
      canonical: 'wet_surface',
      synonyms: ['wet floor', 'slick surface', 'slippery', 'standing water', 'spill', 'slick walkway']
    },
    {
      family: 'slips_trips_falls',
      canonical: 'trip_hazard',
      synonyms: ['trip hazard', 'uneven surface']
    },
    {
      family: 'fall_protection',
      canonical: 'open_edge',
      synonyms: ['open edge', 'unprotected edge', 'leading edge']
    },
    {
      family: 'fall_protection',
      canonical: 'missing_guardrail',
      synonyms: ['missing guardrail', 'no fall protection']
    },
    {
      family: 'fall_protection',
      canonical: 'elevated_work',
      synonyms: ['elevated work', 'working at height']
    },
    {
      family: 'mobile_equipment',
      canonical: 'mobile_equipment',
      synonyms: ['forklift', 'loader', 'haul truck', 'powered industrial truck', 'mobile equipment']
    },
    {
      family: 'mobile_equipment',
      canonical: 'pedestrian_exposure',
      synonyms: ['blind spot', 'pedestrian exposure', 'pedestrians nearby']
    },
    {
      family: 'hazcom',
      canonical: 'unlabeled',
      synonyms: ['unlabeled', 'no label', 'illegible label']
    },
    {
      family: 'hazcom',
      canonical: 'missing_sds',
      synonyms: ['missing sds', 'unknown chemical']
    },
    {
      family: 'hazcom',
      canonical: 'secondary_container',
      synonyms: ['secondary container', 'secondary chemical container']
    },
    {
      family: 'confined_space',
      canonical: 'confined_space',
      synonyms: ['confined space', 'tank', 'vessel', 'pit']
    },
    {
      family: 'confined_space',
      canonical: 'atmospheric_hazard',
      synonyms: ['atmospheric hazard', 'oxygen deficient', 'no air monitoring']
    },
    {
      family: 'emergency_egress',
      canonical: 'blocked_egress',
      synonyms: ['blocked exit', 'blocked egress', 'obstructed walkway', 'emergency route blocked', 'exit access blocked', 'emergency exit route']
    }
  ];

  expand(input: SemanticSynonymExpansionInput): SemanticSynonymExpansionResult {
    const { observationText } = input;
    const normalizedText = this.normalize(observationText);
    
    const expandedSignals: string[] = [];
    const detectedSynonymGroups: string[] = [];
    const primarySemanticFamilies: string[] = [];
    const matchedCanonicalTerms: string[] = [];
    const possibleAmbiguities: string[] = [];
    const reviewerQuestions: string[] = [];
    
    // NLP Tokenization and Stemming
    const tokenizer = new natural.WordTokenizer();
    const observationTokens = tokenizer.tokenize(normalizedText) || [];
    const stemmedObservation = observationTokens.map(t => natural.PorterStemmer.stem(t));

    const allSynonyms = this.synonymGroups.flatMap(group => 
      group.synonyms.map(syn => ({ ...group, synonym: syn }))
    ).sort((a, b) => b.synonym.length - a.synonym.length);

    allSynonyms.forEach(item => {
      const synNorm = this.normalize(item.synonym);
      const synTokens = tokenizer.tokenize(synNorm) || [];
      const stemmedSynTokens = synTokens.map(t => natural.PorterStemmer.stem(t));

      let isMatch = false;

      // Direct inclusion match
      if (normalizedText.includes(synNorm)) {
        isMatch = true;
      } else if (stemmedSynTokens.length > 0) {
        // Fallback to Stemmed multi-token overlap
        let matchCount = 0;
        for (const st of stemmedSynTokens) {
          if (stemmedObservation.includes(st)) {
            matchCount++;
          }
        }
        if (matchCount === stemmedSynTokens.length) {
          isMatch = true;
        }
      }

      if (isMatch) {
        expandedSignals.push(item.synonym);
        detectedSynonymGroups.push(`${item.family}:${item.canonical}`);
        primarySemanticFamilies.push(item.family);
        matchedCanonicalTerms.push(item.canonical);
      }
    });

    const uniqueFamilies = Array.from(new Set(primarySemanticFamilies));
    const uniqueCanonical = Array.from(new Set(matchedCanonicalTerms));
    const uniqueGroups = Array.from(new Set(detectedSynonymGroups));

    // Confidence scoring logic
    let semanticConfidenceScore = 0;
    if (uniqueCanonical.length > 0) {
        semanticConfidenceScore = Math.min(1.0, 0.4 + (uniqueCanonical.length * 0.2));
    }
    
    if (normalizedText.length < 15 && uniqueCanonical.length === 0) {
        semanticConfidenceScore = 0.1;
        reviewerQuestions.push('The observation is very short and lacks clear safety signals. Can you provide more detail?');
    }

    return {
      version: 'v1',
      normalizedObservationText: normalizedText,
      expandedSignals: Array.from(new Set(expandedSignals)),
      detectedSynonymGroups: uniqueGroups,
      primarySemanticFamilies: uniqueFamilies,
      semanticConfidenceScore,
      matchedCanonicalTerms: uniqueCanonical,
      unmappedTerms: [], 
      possibleAmbiguities,
      governanceWarnings: [],
      reviewerQuestions,
      advisoryBoundary: 'SafeScope semantic expansion is advisory only and utilizes NLP stemming and deterministic mapping.'
    };
  }

  private normalize(text: string): string {
    return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
