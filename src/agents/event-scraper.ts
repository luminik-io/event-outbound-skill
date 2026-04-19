import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import { EventContext } from '../types/index.js';

export async function scrapeEvent(url: string): Promise<EventContext> {
  let eventName: string | null = null;
  let dates: string | null = null;
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
      eventName = dom.window.document.querySelector('title')?.textContent || article.title;
      // Attempt to extract dates and location from the article text or meta tags
      // This is a basic attempt and can be improved with more sophisticated NLP or regex
      dates = dom.window.document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
              dom.window.document.querySelector('meta[name="event:start_date"]')?.getAttribute('content') ||
              dom.window.document.querySelector('time')?.textContent ||
              null;

      location = dom.window.document.querySelector('meta[name="event:location"]')?.getAttribute('content') ||
                 dom.window.document.querySelector('.event-location')?.textContent ||
                 null;
    }

    const $ = cheerio.load(html);

    // More specific selectors for common event site structures
    // Event Name
    if (!eventName) {
      eventName = $('h1.event-title, .event-header h1, #event-title').first().text().trim();
    }

    // Dates
    if (!dates) {
      dates = $('time.dtstart, .event-dates, .event-date, [itemprop="startDate"]').first().text().trim();
      if (!dates) {
        // Try to find a date range or single date in the text
        const dateMatch = html.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:-\s*\d{1,2}(?:st|nd|rd|th)?)?,?\s+\d{4}\b/);
        if (dateMatch) dates = dateMatch[0];
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
    $('h2.agenda-title, .session-title h3, .agenda-item h4').each((_, element) => {
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
    location: location || 'Unknown Location',
    agendaTitles: agendaTitles,
    speakers: speakers,
    exhibitorList: exhibitorList,
  };
}
