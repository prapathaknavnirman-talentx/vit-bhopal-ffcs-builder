import { drizzle } from 'drizzle-orm/netlify-db';
import { avg, count, desc } from 'drizzle-orm';
import { reviews } from '../../db/schema.js';
import type { Config } from '@netlify/functions';

export default async (req: Request) => {
  const reply = (body: unknown, status = 200) => Response.json(body, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
  if (!['GET', 'POST'].includes(req.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, POST' } });
  }
  try {
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && origin !== new URL(req.url).origin) return reply({ error: 'Please submit from this website.' }, 403);
      if (!req.headers.get('content-type')?.includes('application/json')) return reply({ error: 'JSON required.' }, 415);
      const raw = await req.text();
      if (raw.length > 12000) return reply({ error: 'Review is too long.' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return reply({ error: 'Invalid review.' }, 400); }
      if (!body || typeof body !== 'object') return reply({ error: 'Invalid review.' }, 400);
      const { name, rating, comment, website } = body;
      if (website) return reply({ error: 'Unable to submit this review.' }, 400);
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 80 ||
          !Number.isInteger(rating) || rating < 1 || rating > 5 ||
          typeof comment !== 'string' || !comment.trim() || comment.trim().length > 1500) {
        return reply({ error: 'Add your name, a rating from 1 to 5, and a review of up to 1,500 characters.' }, 400);
      }
      const db = drizzle();
      const [review] = await db.insert(reviews).values({ name: name.trim(), rating, comment: comment.trim() }).returning();
      return reply({ review }, 201);
    }
    const db = drizzle();
    const [summary] = await db.select({ total: count(), average: avg(reviews.rating) }).from(reviews);
    const recent = await db.select().from(reviews).orderBy(desc(reviews.createdAt), desc(reviews.id)).limit(5);
    return reply({ total: summary.total, average: Number(summary.average || 0), reviews: recent });
  } catch {
    return reply({ error: 'Reviews are temporarily unavailable. Please try again shortly.' }, 503);
  }
};

export const config: Config = { path: '/api/reviews', rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
