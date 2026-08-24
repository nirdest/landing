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

/* Контакт должен быть похож на контакт, а не на любые пять символов: раньше
   проверялась только длина, и «аааааа» доезжало письмом, на которое некому
   ответить. Принимаем четыре формы, которые обещает форма, и ищем их где
   угодно в строке — человек пишет «мой телеграм @nirdest», и отвергать это
   значит терять живую заявку. Правила намеренно мягкие: пропустить лишнее
   дешевле, чем потерять настоящего клиента.

   Копия этой функции живёт в js/main.js. Дублирование намеренно: сайт и воркер
   деплоятся раздельно, общего модуля между ними нет, а проверка только в
   браузере не значит ничего — сюда POST-ят напрямую. Меняешь одну — меняй обе. */
function looksLikeContact(s) {
  if (s.length < 5 || s.length > 200) return false;
  if (/[^\s@]+@[^\s@]+\.[a-z\u0400-\u04FF]{2,}/i.test(s)) return true;        // email
  if (/(^|[\s(/])@[a-z0-9_]{4,31}\b/i.test(s)) return true;                   // @телеграм
  if (/([a-z0-9-]+\.)+[a-z\u0400-\u04FF]{2,}(\/|\b)/i.test(s)) return true;   // ссылка или домен
  const digits = s.replace(/\D/g, '');
  if (digits.length >= 7 && digits.length <= 15 && /(^|\s)\+?\d[\d\s()\-.]{5,}$/.test(s)) return true;
  return false;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('method not allowed', { status: 405 });

    /* Форма — единственный легитимный источник. Пустой Origin допускаем: same-origin
       POST его может не прислать. Это не замена rate-limit на краю, а отсечение
       браузерного кросс-сайт вектора: чужая страница не сможет слать письма руками
       своих посетителей. */
    const origin = request.headers.get('origin');
    if (origin && origin !== 'https://devops.toys') return new Response('forbidden', { status: 403 });

    /* Тело разбирается до всякой валидации, поэтому ограничиваем его заранее. */
    if (Number(request.headers.get('content-length')) > 2048) return new Response('too large', { status: 413 });

    let d;
    try { d = await request.json(); } catch { return new Response('bad json', { status: 400 }); }

    const contact = String(d.contact || '').trim();
    if (!looksLikeContact(contact)) return new Response('bad contact', { status: 400 });

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
      `UA:        ${(request.headers.get('user-agent') || '?').slice(0, 200)}`,
    ].join('\n');

    /* Видно в `wrangler tail`: без этого успешный send() неотличим от несконфигурированного.
       Сам контакт не логируем — это персональные данные живого человека, и они уже есть в письме. */
    console.log('lead', contact.length, 'chars →', String(env.LEAD_TO || 'LEAD_TO NOT SET').replace(/(.{2}).*(@.*)/, '$1***$2'));

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
