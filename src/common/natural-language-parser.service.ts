import { Injectable } from '@nestjs/common';
import { COUNTRY_MAP } from './country-map';

export interface ParsedQuery {
  gender?: string;
  age_group?: string;
  min_age?: number;
  max_age?: number;
  country_id?: string;
}

@Injectable()
export class NaturalLanguageParserService {
  parse(query: string): ParsedQuery {
    if (!query || !query.trim()) {
      throw new Error('Unable to interpret query');
    }

    const q = query.toLowerCase().trim();
    const parsed: ParsedQuery = {};

    // -------------------------
    // GENDER
    // -------------------------
    const hasMale = /\b(male|males|man|men)\b/.test(q);
    const hasFemale = /\b(female|females|woman|women)\b/.test(q);

    if (hasMale && !hasFemale) parsed.gender = 'male';
    if (hasFemale && !hasMale) parsed.gender = 'female';
    // if both → ignore gender

    // -------------------------
    // AGE GROUP
    // -------------------------
    if (q.includes('teen')) parsed.age_group = 'teenager';
    if (q.includes('adult')) parsed.age_group = 'adult';
    if (q.includes('child')) parsed.age_group = 'child';
    if (q.includes('senior')) parsed.age_group = 'senior';

    // -------------------------
    // YOUNG (SPEC RULE)
    // -------------------------
    if (q.includes('young')) {
      parsed.min_age = 16;
      parsed.max_age = 24;
    }

    // -------------------------
    // ABOVE / BELOW (SPEC EXPECTED)
    // -------------------------
    const aboveMatch = q.match(/above (\d+)/);
    if (aboveMatch) parsed.min_age = Number(aboveMatch[1]);

    const belowMatch = q.match(/below (\d+)/);
    if (belowMatch) parsed.max_age = Number(belowMatch[1]);

    // -------------------------
    // COUNTRY
    // -------------------------
    for (const country in COUNTRY_MAP) {
      if (q.includes(country)) {
        parsed.country_id = COUNTRY_MAP[country].id;
      }
    }

    // -------------------------
    // FINAL CHECK
    // -------------------------
    if (Object.keys(parsed).length === 0) {
      throw new Error('Unable to interpret query');
    }

    return parsed;
  }
}