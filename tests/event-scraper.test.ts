import { describe, it, expect } from 'vitest';
import { scrapeEvent } from '../src/agents/event-scraper';
import { readFileSync } from 'fs';
import * as path from 'path';

describe('scrapeEvent', () => {
  it('should correctly scrape Eventbrite-like HTML', async () => {
    const htmlFixture = readFileSync(path.join(__dirname, 'fixtures/event-pages/eventbrite.html'), 'utf-8');
    // Mock fetch to return the fixture HTML
    global.fetch = async (url: RequestInfo | URL) => {
      return new Response(htmlFixture, { status: 200 });
    };

    const eventContext = await scrapeEvent('https://www.eventbrite.com/e/mock-event-tickets-1234567890');

    expect(eventContext.name).toContain('Mock Tech Conference 2024');
    expect(eventContext.dates).toContain('October 26 - 28, 2024');
    expect(eventContext.location).toContain('San Francisco, CA');
    expect(eventContext.agendaTitles.length).toBeGreaterThan(0);
    expect(eventContext.speakers.length).toBeGreaterThan(0);
    expect(eventContext.exhibitorList.length).toBeGreaterThan(0);
  });

  it('should correctly scrape Luma-like HTML', async () => {
    const htmlFixture = readFileSync(path.join(__dirname, 'fixtures/event-pages/luma.html'), 'utf-8');
    global.fetch = async (url: RequestInfo | URL) => {
      return new Response(htmlFixture, { status: 200 });
    };

    const eventContext = await scrapeEvent('https://lu.ma/mock-summit');

    expect(eventContext.name).toContain('Luma AI/ML Summit');
    expect(eventContext.dates).toContain('Nov 15, 2024');
    expect(eventContext.location).toContain('New York, NY');
    expect(eventContext.agendaTitles.length).toBeGreaterThan(0);
    expect(eventContext.speakers.length).toBeGreaterThan(0);
    expect(eventContext.exhibitorList.length).toBe(0); // Luma might not have explicit exhibitor lists
  });

  it('should gracefully handle missing elements', async () => {
    const htmlFixture = `<html><head><title>Simple Event</title></head><body><h1>Simple Event Title</h1><p>Date: 2025-01-01</p></body></html>`;
    global.fetch = async (url: RequestInfo | URL) => {
      return new Response(htmlFixture, { status: 200 });
    };

    const eventContext = await scrapeEvent('https://example.com/simple-event');

    expect(eventContext.name).toContain('Simple Event Title');
    expect(eventContext.dates).toContain('2025-01-01');
    expect(eventContext.location).toContain('Unknown Location');
    expect(eventContext.agendaTitles).toEqual([]);
    expect(eventContext.speakers).toEqual([]);
    expect(eventContext.exhibitorList).toEqual([]);
  });
});
