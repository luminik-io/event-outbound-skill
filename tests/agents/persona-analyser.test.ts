import { describe, it, expect } from 'vitest';
import { personaAnalyser } from '../../src/agents/persona-analyser';
import { AttendeePersona } from '../../src/types/index.js';

describe('personaAnalyser (fixture stub)', () => {
  it('throws for profile text shorter than the minimum', async () => {
    await expect(personaAnalyser({ profileText: 'too short' })).rejects.toThrow(
      /at least/,
    );
  });

  it('returns a deterministic personaId for the same inputs', async () => {
    const longText = 'x'.repeat(500);
    const a: AttendeePersona = await personaAnalyser({ profileText: longText });
    const b: AttendeePersona = await personaAnalyser({ profileText: longText });
    expect(a.personaId).toBeDefined();
    expect(a.personaId).toEqual(b.personaId);
  });
});
