const { randomUUID } = require('node:crypto');
const API = 'https://services.leadconnectorhq.com';
const FROM = 'BadAAAS Support <support@badaaas.com>';
// Simple visitor contact form: name, email, optional phone, message. Nothing medical.
const fields = ['name', 'email', 'phone', 'message'];
const labels = { name: 'Name', email: 'Email', phone: 'Phone', message: 'Message' };
const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function parse(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid');
  if (typeof body._gotcha !== 'undefined' && (typeof body._gotcha !== 'string' || body._gotcha.trim())) throw new Error('spam');
  const data = {};
  for (const field of fields) {
    const value = body[field] === undefined ? '' : body[field];
    if (typeof value !== 'string' || value.length > (field === 'message' ? 3000 : 200) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error('invalid');
    data[field] = value.trim();
  }
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.message) throw new Error('invalid');
  if (data.phone && !/^[+\d() .-]{7,40}$/.test(data.phone)) throw new Error('invalid'); // phone is optional
  return data;
}

async function deliver(data, config, fetcher = fetch) {
  const { token, bcc, contactId, to } = config;
  if (!token || !contactId || to !== 'drgeri@aol.com' || bcc !== 'dan@badaaas.com') throw new Error('configuration');
  const id = randomUUID();
  const html = '<h2>Website contact request</h2><p>Contact form submission. Reply using the visitor details below.</p>' + fields.filter(field => data[field]).map(field => `<p><strong>${escape(labels[field] || field)}:</strong><br>${escape(data[field]).replace(/\n/g, '<br>')}</p>`).join('');
  // Exactly one provider request per invocation. No automatic retries.
  // With no shared storage, separate invocations can send duplicates.
  let result;
  try {
    const response = await fetcher(`${API}/conversations/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, Version: '2021-07-28', 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(12000),
      body: JSON.stringify({ type: 'Email', contactId, emailFrom: FROM, emailTo: to, emailBcc: [bcc], subject: `Website contact [${id.slice(0, 24)}]`, html })
    });
    if (!response.ok) throw new Error('send');
    result = await response.json();
    if (typeof result.messageId !== 'string' || !result.messageId || result.error) throw new Error('send');
  } catch { throw new Error('unconfirmed-submission'); }
  return { ok: true, messageId: result.messageId };
}
module.exports = { parse, deliver };
