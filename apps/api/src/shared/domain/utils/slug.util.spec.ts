
import { describe, expect, it } from 'vitest';

import { generateSlug } from './slug.util.js';

describe('generateSlug', () => {
  it('should convert spaces into hyphens', () => {
    expect(generateSlug('Backend API')).toBe('backend-api');
  });

  it('should convert uppercase letters to lowercase', () => {
    expect(generateSlug('API SENTINEL')).toBe('api-sentinel');
  });

  it('should normalize accented characters', () => {
    expect(generateSlug('Café & QA Team')).toBe('cafe-qa-team');
  });

  it('should trim whitespace', () => {
    expect(generateSlug('  Backend API  ')).toBe('backend-api');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Backend @ API!')).toBe('backend-api');
  });

  it('should limit slug length to 60 characters', () => {
    expect(generateSlug('a'.repeat(70))).toHaveLength(60);
  });

  it('should return an empty string when no supported characters exist', () => {
    expect(generateSlug('🔥')).toBe('');
  });
});
