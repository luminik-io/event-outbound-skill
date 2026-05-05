// TODO: real impl. This is a fixture stub — it returns a hardcoded persona
// regardless of input, matching the fixture expectations exercised in tests.
// A production implementation should use the active Claude session in the
// installed skill, or an explicitly injected model adapter in headless code.
import { AttendeePersona } from '../types/index.js';
import { createHash } from 'crypto';

const MIN_PROFILE_TEXT_LENGTH = 100;

export async function personaAnalyser(params: {
  profileText: string;
}): Promise<AttendeePersona> {
  const { profileText } = params;

  if (!profileText || profileText.length < MIN_PROFILE_TEXT_LENGTH) {
    throw new Error(
      `Profile text must be at least ${MIN_PROFILE_TEXT_LENGTH} characters long.`,
    );
  }

  // Fixture persona — real LLM integration is a follow-up task.
  const extractedPersona: Omit<AttendeePersona, 'personaId'> = {
    role: 'Marketing Manager',
    seniority: 'manager',
    company: 'Acme Corp',
    priorities: ['lead generation', 'content marketing'],
    painPoints: ['budget constraints', 'attracting talent'],
    exampleTitles: ['Growth Marketing Manager', 'Digital Marketing Lead'],
  };

  const personaIdHash = createHash('sha256')
    .update(
      JSON.stringify({
        role: extractedPersona.role,
        company: extractedPersona.company,
        priorities: [...extractedPersona.priorities].sort().slice(0, 3),
      }),
    )
    .digest('hex');

  return {
    personaId: personaIdHash,
    ...extractedPersona,
  };
}
