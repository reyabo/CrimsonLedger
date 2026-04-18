import { describe, expect, it } from 'vitest';
import { exportEnvelopeSchema, profileSchema } from '@/domain/schema';
import { createDefaultProfile } from '@/domain/defaults';

describe('schema', () => {
  it('accepts a default profile', () => {
    const p = createDefaultProfile({ name: 'Rook' });
    expect(profileSchema.parse(p)).toMatchObject({ name: 'Rook' });
  });

  it('rejects out-of-range hunger', () => {
    const p = { ...createDefaultProfile({ name: 'Bad' }), thirst: 9 };
    expect(() => profileSchema.parse(p)).toThrow();
  });

  it('export envelope roundtrip', () => {
    const env = {
      version: 1 as const,
      exportedAt: Date.now(),
      profiles: [createDefaultProfile({ name: 'A' }), createDefaultProfile({ name: 'B' })],
    };
    const parsed = exportEnvelopeSchema.parse(env);
    expect(parsed.profiles).toHaveLength(2);
  });

  it('rejects wrong version', () => {
    const env = { version: 2, exportedAt: 0, profiles: [] };
    expect(() => exportEnvelopeSchema.parse(env)).toThrow();
  });
});
