import { EmailMessage } from 'cloudflare:email';

/* Заявка с формы devops.toys → письмо на верифицированный destination-адрес.
   Бесплатно на Workers Free: отправка на свои же verified destinations квоту не тратит. */

const b64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/(.{76})/g, '$1\r\n');

function mime({ from, to, subject, text }) {
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?utf-8?B?${b64(subject).replace(/\r\n/g, '')}?=`,
    `Message-ID: <${crypto.randomUUID()}@${from.split('@')[1]}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text),
  ].join('\r\n');
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('method not allowed', { status: 405 });

    let d;
    try { d = await request.json(); } catch { return new Response('bad json', { status: 400 }); }

    const contact = String(d.contact || '').trim();
    if (contact.length < 5 || contact.length > 200) return new Response('bad contact', { status: 400 });

    // honeypot: молча подтверждаем, письмо не шлём
    if (d.company) return Response.json({ ok: true });

    const cf = request.cf || {};
    const body = [
      `Контакт:   ${contact}`,
      `Язык:      ${String(d.language || '').slice(0, 8)}`,
      `Страница:  ${String(d.url || '').slice(0, 300)}`,
      `Реферер:   ${String(d.referrer || '').slice(0, 300)}`,
      `Время:     ${new Date().toISOString()}`,
      `Откуда:    ${cf.country || '?'} / ${cf.city || '?'}`,
      `UA:        ${request.headers.get('user-agent') || '?'}`,
    ].join('\n');

    /* Видно в `wrangler tail`: без этого успешный send() неотличим от несконфигурированного. */
    console.log('lead from', contact, '→', String(env.LEAD_TO || 'LEAD_TO NOT SET').replace(/(.{2}).*(@.*)/, '$1***$2'));

    try {
      await env.EMAIL.send(new EmailMessage(
        env.LEAD_FROM,
        env.LEAD_TO,
        mime({ from: env.LEAD_FROM, to: env.LEAD_TO, subject: `Заявка devops.toys: ${contact}`, text: body }),
      ));
    } catch (e) {
      console.log('send failed:', e && e.message);
      return new Response('send failed', { status: 502 });
    }

    console.log('sent ok');
    return Response.json({ ok: true });
  },
};
