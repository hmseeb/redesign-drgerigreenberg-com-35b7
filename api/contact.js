// Server-only helper. Kept under api/_lib so Vercel never serves it as a
// static asset and never turns it into its own route.
const { parse, deliver } = require('./_lib/contact');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const json = (req.headers.accept || '').includes('application/json');
  function reply(status, ok, message) {
    if (json) return res.status(status).json({ ok, message });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'");
    return res.status(status).send(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Contact Dr. Geri</title><main style="max-width:40rem;margin:4rem auto;padding:1rem;font:1.2rem system-ui"><h1>${ok ? 'Thank you' : 'Submission status'}</h1><p>${message}</p><p><a href="/contact/">Return to the contact page</a></p><p>For urgent questions, call or text <a href="tel:+18183241539">(818) 324-1539</a>.</p></main></html>`);
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(405, false, 'Please use the contact form.');
  }
  const allowed = new Set(['https://redesign-drgerigreenberg-com-35b7.vercel.app', ...(process.env.CONTACT_ALLOWED_ORIGINS || '').split(',').filter(Boolean)]);
  if (!allowed.has(req.headers.origin)) return reply(403, false, 'Please use the contact form on this website.');
  if (Number(req.headers['content-length']) > 12000) return reply(413, false, 'Please shorten your message.');
  const type = (req.headers['content-type'] || '').split(';')[0];
  if (!['application/json', 'application/x-www-form-urlencoded'].includes(type)) return reply(415, false, 'Please use the contact form.');
  let data;
  try { data = parse(req.body); } catch {
    return reply(400, false, 'Please check your name, email and message.');
  }
  try {
    if (process.env.CONTACT_DELIVERY_ENABLED !== 'true') throw new Error('disabled');
    await deliver(data, { token: process.env.CONTACT_GHL_TOKEN, bcc: process.env.CONTACT_INTERNAL_BCC, contactId: process.env.CONTACT_GHL_CONTACT_ID, to: process.env.CONTACT_RECIPIENT });
    return reply(200, true, 'Your message was submitted. For urgent questions, call or text Dr. Geri.');
  } catch (error) {
    // Never log submissions, provider responses, email addresses or credentials.
    return reply(503, false, 'We could not confirm submission. Please call or text Dr. Geri before starting another request.');
  }
};
