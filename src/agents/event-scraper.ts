import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { EventContext } from '../types/index.js';

export async function scrapeEvent(url: string): Promise<EventContext> {
  let eventName: string | null = null;
  let dates: string | null = null;
  let startDate: string | null = null;
  let endDate: string | null = null;
  let location: string | null = null;
  const agendaTitles: string[] = [];
  const speakers: string[] = [];
  const exhibitorList: string[] = [];

  try {
    const response = await fetch(url);
    const html = await response.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article) {
      // Prefer an explicit event title (h1) over the raw document <title>, which is
      // often a shorter / branded variant. Fall back to Readability's article title,
      // then to the document <title>.
      const h1Title = dom.window.document.querySelector('h1.event-title, .event-header h1, #event-title, h1')?.textContent?.trim();
      const docTitle = dom.window.document.querySelector('title')?.textContent?.trim() || null;
      eventName = h1Title || article.title || docTitle;
      // Attempt to extract dates and location from the article text or meta tags.
      // This is a basic attempt and can be improved with more sophisticated NLP or regex.
      dates = dom.window.document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
              dom.window.document.querySelector('meta[name="event:start_date"]')?.getAttribute('content') ||
              dom.window.document.querySelector('time')?.textContent ||
              null;

      location = dom.window.document.querySelector('meta[name="event:location"]')?.getAttribute('content') ||
                 dom.window.document.querySelector('.event-location')?.textContent ||
                 null;
    }

    const $ = cheerio.load(html);
    const jsonLdEvents = extractJsonLdEvents($);
    const jsonLdEvent = jsonLdEvents[0];
    startDate ||= dateOnly(html.match(/"startDate"\s*:\s*"([^"]+)"/)?.[1]);
    endDate ||= dateOnly(html.match(/"endDate"\s*:\s*"([^"]+)"/)?.[1]);
    if (jsonLdEvent) {
      eventName ||= stringValue(jsonLdEvent.name);
      startDate ||= dateOnly(stringValue(jsonLdEvent.startDate));
      endDate ||= dateOnly(stringValue(jsonLdEvent.endDate));
      if (!dates && (startDate || endDate)) {
        dates = [startDate, endDate].filter(Boolean).join(' - ');
      }
      const locationRecord = jsonLdEvent.location as Record<string, unknown>;
      const jsonLocation =
        typeof jsonLdEvent.location === 'object' && jsonLdEvent.location !== null
          ? stringValue(locationRecord.name) || stringValue(locationRecord.address)
          : stringValue(jsonLdEvent.location);
      location ||= jsonLocation;
    }

    // More specific selectors for common event site structures
    // Event Name
    if (!eventName) {
      eventName = $('h1.event-title, .event-header h1, #event-title').first().text().trim();
    }

    // Dates
    if (!dates) {
      const startEl = $('time.dtstart, .event-dates, .event-date, [itemprop="startDate"]').first();
      dates = startEl.text().trim();
      startDate ||= dateOnly(startEl.attr('datetime') || startEl.attr('content') || dates);
      const endEl = $('[itemprop="endDate"]').first();
      endDate ||= dateOnly(endEl.attr('datetime') || endEl.attr('content') || endEl.text());
      if (!dates) {
        // Try to find a named-month date or range.
        const namedMonthMatch = html.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:-\s*\d{1,2}(?:st|nd|rd|th)?)?,?\s+\d{4}\b/);
        if (namedMonthMatch) {
          dates = namedMonthMatch[0];
          startDate ||= dateOnly(dates);
        } else {
          // Fallback: ISO-8601 style date (YYYY-MM-DD).
          const isoMatch = html.match(/\b\d{4}-\d{2}-\d{2}\b/);
          if (isoMatch) {
            dates = isoMatch[0];
            startDate ||= dateOnly(dates);
          }
        }
      }
    }

    // Location
    if (!location) {
      location = $('[itemprop="location"], .event-location span, .event-venue').first().text().trim();
      if (!location) {
        const locationMatch = html.match(/\b(?:at|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)\b/);
        if (locationMatch) location = locationMatch[0];
      }
    }

    // Agenda Titles
    // Cover common patterns: explicit agenda/session classes, plus session-card
    // style wrappers used by Luma-like layouts.
    $('h2.agenda-title, .session-title h3, .session-title, .agenda-item h4, .agenda-item h3, .agenda-item h2, .session-card h3, .session-card h4, .session h3').each((_, element) => {
      const title = $(element).text().trim();
      if (title) agendaTitles.push(title);
    });

    // Speakers
    $('.speaker-name, .speaker-card h3, [itemprop="speaker"]').each((_, element) => {
      const name = $(element).text().trim();
      if (name) speakers.push(name);
    });

    // Exhibitor List
    $('.exhibitor-name, .exhibitor-card h3, .exhibitor-list li').each((_, element) => {
      const name = $(element).text().trim();
      if (name) exhibitorList.push(name);
    });

  } catch (error) {
    console.error(`Error scraping event from ${url}:`, error);
    // Gracefully degrade by returning null for fields if an error occurs
  }

  return {
    name: eventName || 'Unknown Event',
    dates: dates || 'Unknown Dates',
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    location: location || 'Unknown Location',
    agendaTitles: agendaTitles,
    speakers: speakers,
    exhibitorList: exhibitorList,
  };
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const iso = /\b(\d{4}-\d{2}-\d{2})(?:\b|T)/.exec(value);
  if (iso) return iso[1];

  const months: Record<string, string> = {
    jan: '01',
    january: '01',
    feb: '02',
    february: '02',
    mar: '03',
    march: '03',
    apr: '04',
    april: '04',
    may: '05',
    jun: '06',
    june: '06',
    jul: '07',
    july: '07',
    aug: '08',
    august: '08',
    sep: '09',
    sept: '09',
    september: '09',
    oct: '10',
    october: '10',
    nov: '11',
    november: '11',
    dec: '12',
    december: '12',
  };
  const named =
    /\b(January|February|March|April|May|June|July|August|September|Sept|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*[-–]\s*\d{1,2}(?:st|nd|rd|th)?)?,?\s+(\d{4})\b/i.exec(
      value,
    );
  if (!named) return null;
  const month = months[named[1].toLowerCase().replace('.', '')];
  return `${named[3]}-${month}-${named[2].padStart(2, '0')}`;
}

function extractJsonLdEvents($: ReturnType<typeof cheerio.load>): Array<Record<string, unknown>> {
  const events: Array<Record<string, unknown>> = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text();
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        collectEventNodes(node, events);
      }
    } catch {
      // Ignore malformed third-party JSON-LD.
    }
  });
  return events;
}

function collectEventNodes(value: unknown, out: Array<Record<string, unknown>>): void {
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  const type = record['@type'];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((t) => String(t).toLowerCase() === 'event')) {
    out.push(record);
  }
  const graph = record['@graph'];
  if (Array.isArray(graph)) {
    for (const node of graph) collectEventNodes(node, out);
  }
}
