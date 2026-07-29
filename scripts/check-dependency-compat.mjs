import { minimatch } from 'minimatch';

const cases = [
  ['touch.ts', '*.{js,ts}', true],
  ['touch.md', '*.{js,ts}', false],
  ['event-2.json', 'event-{1,2}.json', true],
];

for (const [value, pattern, expected] of cases) {
  const actual = minimatch(value, pattern);
  if (actual !== expected) {
    throw new Error(
      `minimatch compatibility check failed for ${value} against ${pattern}: ` +
        `expected ${expected}, received ${actual}`,
    );
  }
}

process.stdout.write('dependency compatibility checks passed\n');
