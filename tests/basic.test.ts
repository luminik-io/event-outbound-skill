import { expect, test } from 'vitest';
import { EventContext } from '../src/types/index.js';

test('EventContext type exists', () => {
  const context: EventContext = {
    name: 'Test Event',
    dates: 'Jan 1-2',
    location: 'Online',
    agendaTitles: [],
    speakers: [],
    exhibitorList: [],
  };
  expect(context).toBeDefined();
});
