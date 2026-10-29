(function(){
'use strict';

/* ================= i18n ================= */
var I18N = {
  /* Русский — базовая локаль, и все его строки уже лежат в разметке; они снимаются
     оттуда в BASE при старте (см. ниже). Здесь остаётся только то, чего в разметке
     нет: заголовок документа, meta-описание и тексты состояний формы. */
  ru: {
    'meta.title':"DevOps.toys — IT, которое просто работает",
    'meta.desc':"Команда инженеров, которая берёт IT на себя: инфраструктура, DevOps, сопровождение и создание нового. Разово или на постоянной основе.",
    'form.sending':'Отправляем…',
    'form.err':'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.',
    'form.valEmpty':'Укажите контакт, иначе мы не сможем ответить.',
    'form.valErr':'Это не похоже на контакт. Подойдёт email, @телеграм, ссылка на LinkedIn или телефон.',
  },
  en: {
    'skip':'Skip to content',
    'meta.title':"DevOps.toys — IT that just works",
    'meta.desc':"A team of engineers that takes IT off your plate: infrastructure, DevOps, ongoing support and building new things. One-off or ongoing.",
    'nav.services':'Services','nav.process':'How we work','nav.formats':'Formats','nav.faq':'FAQ','nav.contact':"Let’s talk",
    'hero.h1':'<span class="ln"><span>IT that</span></span><span class="ln"><span>just works<i class="dot">.</i></span></span>',
    'hero.lead':"We are a team of engineers who take your IT headaches off your hands. We look after what you already run and build what you need next. One-off or ongoing.",
    'hero.cta':"Let’s talk",'hero.cta2':'What we do',
    'hero.note':'your task —<br>our job',
    'hero.brick':'YOUR TASK',
    'hero.artAlt':'A crane lowers a brick labelled with your task onto a stack of cloud, Kubernetes, CI/CD, automation and monitoring',
    'mq.list':'Cloud ✦ Kubernetes ✦ CI/CD ✦ Infrastructure as code ✦ Monitoring ✦ Security ✦ Databases ✦ Backups ✦ Networks ✦ Development ✦ AI prototypes ✦ Support ✦ ',
    'svc.h':'What we take off your plate',
    'svc.note':'pick what you need —<br>or we’ll put it together',
    'svc.1t':'Infrastructure & cloud','svc.1d':'We design, migrate and tidy up what is already running.',
    'svc.2t':'DevOps & CI/CD','svc.2d':'Builds, deploys and environments — so a release is routine, not an event.',
    'svc.3t':'Support & maintenance','svc.3d':'We watch, update and fix things so you don’t have to think about them.',
    'svc.4t':'Building new things','svc.4d':'From idea and prototype to production — AI projects included.',
    'svc.5t':'Monitoring & reliability','svc.5d':'We hear about a problem before your users do.',
    'svc.6t':'Security & data','svc.6d':'Access, secrets and backups that actually restore.',
    'svc.7t':'FinOps & optimisation','svc.7d':'We cut wasted spend and make your infrastructure more efficient.',
    'st.h':'You don’t need to understand IT. That’s what we’re\u00a0for.',
    'st.p':'No hunting for contractors, interviewing engineers or learning the jargon. Tell us what’s in the way — we take it from there: figure it out, bring in the right people and see it through.',
    'prc.h':'How we work',
    'prc.note':'the first call<br>is free',
    'prc.1t':'You tell us','prc.1d':'Describe the problem in your own words. No spec needed.',
    'prc.2t':'We dig in','prc.2d':'We look at what’s going on and propose a clear plan: what we’ll do, by when and what it costs.',
    'prc.3t':'We do it','prc.3d':'We carry out the agreed plan and hand over an audit with before-and-after metrics — the result shows in numbers.',
    'prc.4t':'We stay close','prc.4d':'If you need it, we take the system on for ongoing support.',
    'fmt.h':'One-off or ongoing',
    'fmt.1t':'A one-off task','fmt.1d':'We come in, figure it out, fix it and hand it over. No commitment beyond that.',
    'fmt.1a':'Fix what’s broken or slow','fmt.1b':'Migrations, launches, set-up from scratch','fmt.1c':'An audit and a plan for what comes next',
    'fmt.2t':'Ongoing support','fmt.2d':'We become your IT department. You run the business, we handle the rest.',
    'fmt.2a':'Monitoring and incident response','fmt.2b':'Updates, backups, access','fmt.2c':'Infrastructure that grows with the product',
    'fmt.3t':'Need someone very specific?','fmt.3d':'We find a specialist for your narrow task, brief them and check the result. You won’t have to be involved.',
    'faq.h':'Frequently asked',
    'faq.q1':'What does it cost?','faq.a1':'It depends on the task: we quote the price and timeline after the first call, before any work starts. It usually costs less than hiring your own DevOps team — you pay for results, not headcount. And FinOps optimisation can do more than pay for itself: it can cut your infrastructure budget.',
    'faq.q2':'Do we need a technical spec?','faq.a2':'No. Tell us what’s in the way — turning that into a plan is our job.',
    'faq.q3':'Is it only DevOps?','faq.a3':'No. Infrastructure, support, building new things. If the task is narrow, we bring in the right specialist and own the result.',
    'faq.q4':'Can we start with one small task?','faq.a4':'Yes. One task, no commitment. Whether to continue is up to you.',
    'faq.q5':'How do you handle access?','faq.a5':'We take only what the task needs, on your terms. You grant and revoke access.',
    'faq.q6':'What do we keep afterwards?','faq.a6':'We work GitOps-style and make every change through code wherever we can. So what stays with you is commits, reports and scripts, plus videos and articles to train your team and recommendations for what comes next.',
    'cta.h':'Serious IT.<br>No headaches<i class="dot">.</i>',
    'cta.p':'Tell us what’s in the way. We’ll reply, clarify the task and suggest where to start.',
    'cta.btn':"Let’s talk",'cta.note':'we take it from here',
    'form.title':'Tell us about the task',
    'form.desc':'Leave a contact — we’ll get in touch, find out what’s in the way and suggest where to start. The first call commits you to nothing.',
    'form.hint':'Email, Telegram, LinkedIn or phone.',
    'form.label':'Your contact','form.ph':'name@example.com or @username',
    'form.send':'Send','form.sending':'Sending…',
    'form.ok':'Thanks! We’ve got your request and will be in touch soon.',
    'form.err':'Couldn’t send the request. Please try again, or email us directly.',
    'form.valEmpty':'Enter a contact, otherwise we can’t reply.',
    'form.valErr':'That doesn’t look like a contact. An email, @telegram handle, LinkedIn link or phone number all work.',
    'form.privacy':'We use your contact only to reply to this request.',
    'form.alt':'Or message us on Telegram:',
    'form.done':'Done','form.closeAria':'Close dialog',
    'foot.rights':'© 2026 DevOps.toys'
  }
};

/* ================= helpers ================= */
function $all(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
function byId(id){ return document.getElementById(id); }
var store = {
  get:function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set:function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
var lang = store.get('devopstoys-lang') === 'en' ? 'en' : 'ru';
/* Русская база снимается прямо с разметки — раньше те же 173 строки лежали второй
   копией в I18N.ru. Побочный эффект важнее экономии: база физически не может
   разойтись с разметкой, а именно это давало сырые "exp.s6k" на странице, когда
   закэшированный main.js отставал от свежего HTML. */
var BASE = {};
$all('[data-i18n]').forEach(function(el){ BASE[el.getAttribute('data-i18n')] = el.textContent; });
$all('[data-i18n-html]').forEach(function(el){ BASE[el.getAttribute('data-i18n-html')] = el.innerHTML; });
$all('[data-i18n-ph]').forEach(function(el){ BASE[el.getAttribute('data-i18n-ph')] = el.placeholder; });
$all('[data-i18n-aria]').forEach(function(el){ BASE[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });

function t(k){ return (lang === 'en' && I18N.en[k]) || BASE[k] || I18N.ru[k] || k; }

/* ================= проверка контакта ================= */
/* Раньше проверялась только длина, и «аааааа» уходило как валидный лид: до
   владельца доезжало письмо, на которое некому ответить. Принимаем четыре
   формы, которые обещает подсказка под полем, и ищем их ГДЕ УГОДНО в строке —
   человек вполне может написать «мой телеграм @nirdest», и отвергать это
   значит терять живую заявку. Пропустить лишнее здесь дешевле, чем потерять
   настоящего клиента, поэтому правила намеренно мягкие.
   ВАЖНО: та же проверка продублирована в worker/lead.js — клиентская
   валидация в одиночку не значит ничего, POST к /api/lead идёт мимо браузера. */
function looksLikeContact(s){
  if(s.length < 5 || s.length > 200) return false;
  if(/[^\s@]+@[^\s@]+\.[a-z\u0400-\u04ff]{2,}/i.test(s)) return true;      /* email */
  if(/(^|[\s(/])@[a-z0-9_]{4,31}\b/i.test(s)) return true;                  /* @телеграм */
  if(/([a-z0-9-]+\.)+[a-z\u0400-\u04ff]{2,}(\/|\b)/i.test(s)) return true;  /* ссылка или домен */
  var digits = s.replace(/\D/g, '');
  if(digits.length >= 7 && digits.length <= 15 && /(^|\s)\+?\d[\d\s()\-.]{5,}$/.test(s)) return true;
  return false;
}

/* ================= language ================= */
function applyLang(l){
  lang = (l === 'en') ? 'en' : 'ru';
  store.set('devopstoys-lang', lang);
  document.documentElement.lang = lang;
  $all('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  $all('[data-i18n-html]').forEach(function(el){ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  $all('[data-i18n-ph]').forEach(function(el){ el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  $all('[data-i18n-aria]').forEach(function(el){ el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
  document.title = t('meta.title');
  var md = document.querySelector('meta[name="description"]');
  if(md) md.setAttribute('content', t('meta.desc'));
  $all('.lang button').forEach(function(b){
    b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
  });
  /* animations.js заново режет заголовок на слова — textContent выше их стёр. */
  document.dispatchEvent(new Event('langchange'));
}
$all('.lang button').forEach(function(b){
  b.addEventListener('click', function(){ applyLang(b.getAttribute('data-lang')); });
});

/* ================= lead modal ================= */
var ovl = byId('ovl'), modal = byId('modal'), page = byId('page');
var leadForm = byId('leadForm'), contactInput = byId('contact');
var fErr = byId('fErr'), mSubmit = byId('mSubmit'), mSubmitTxt = byId('mSubmitTxt');
var fErrMsg = byId('fErrMsg'), fErrMail = byId('fErrMail');

/* Два разных отказа — два разных выхода. Ошибка ввода лечится в самом поле,
   поэтому адрес там ни к чему. Сетевой сбой полем не лечится, и без адреса
   человек упирался в тупик: модалка ставит inert на страницу, так что почта
   в футере в этот момент недостижима. */
/* opts.field — пометить само поле ошибочным, opts.mail — показать адрес.
   Это разные вещи, и путать их нельзя: при сетевом сбое контакт в поле
   совершенно верный, ошиблась сеть. aria-invalid там сказал бы скринридеру,
   что человек ввёл что-то не то, а красная граница показала бы то же глазами. */
function showErr(key, opts){
  opts = opts || {};
  fErrMsg.textContent = t(key);
  fErrMail.hidden = !opts.mail;
  fErr.hidden = false;
  if(opts.field){
    /* Описание накапливается: подсказка остаётся, ошибка добавляется к ней. */
    contactInput.setAttribute('aria-invalid', 'true');
    contactInput.setAttribute('aria-describedby', 'fHint fErr');
  }
}
function clearErr(){
  if(fErr.hidden) return;
  fErr.hidden = true;
  fErrMail.hidden = true;
  contactInput.removeAttribute('aria-invalid');
  contactInput.setAttribute('aria-describedby', 'fHint');
}
/* Пока человек правит контакт, поле не должно продолжать кричать, что оно
   неверно: снимаем метку с первого же символа, перепроверяем при отправке. */
contactInput.addEventListener('input', clearErr);
var mForm = byId('mForm'), mOk = byId('mOk');
var lastFocus = null, sending = false, wasOk = false;
var closeTimer = null, focusTimer = null;

function modalKey(e){
  if(e.key === 'Escape'){ e.preventDefault(); closeModal(); return; }
  if(e.key !== 'Tab') return;
  var f = Array.prototype.filter.call(
    modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'),
    function(el){ return !el.disabled && el.offsetParent !== null && !el.classList.contains('hp'); }
  );
  if(!f.length) return;
  var first = f[0], last = f[f.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
function openModal(){
  clearTimeout(closeTimer);
  clearTimeout(focusTimer);
  if(wasOk){ wasOk = false; mOk.hidden = true; mForm.hidden = false; leadForm.reset(); clearErr(); }
  lastFocus = document.activeElement;
  ovl.hidden = false;
  ovl.classList.add('show');
  page.setAttribute('inert','');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', modalKey);
  focusTimer = setTimeout(function(){ if(!ovl.hidden) contactInput.focus(); }, 60);
}
function closeModal(){
  clearTimeout(focusTimer);
  clearTimeout(closeTimer);
  ovl.classList.remove('show');
  document.removeEventListener('keydown', modalKey);
  page.removeAttribute('inert');
  document.body.style.overflow = '';
  closeTimer = setTimeout(function(){
    ovl.hidden = true;
    if(wasOk){ wasOk = false; mOk.hidden = true; mForm.hidden = false; leadForm.reset(); clearErr(); }
  }, 230);
  if(lastFocus) lastFocus.focus();
}
$all('.js-open').forEach(function(b){ b.addEventListener('click', openModal); });
byId('mClose').addEventListener('click', closeModal);
byId('okClose').addEventListener('click', closeModal);
ovl.addEventListener('mousedown', function(e){ if(e.target === ovl) closeModal(); });

function sendLead(payload){
  /* Cloudflare Worker на devops.toys/api/lead (см. worker/lead.js) шлёт письмо владельцу. */
  // Fail closed on HTTP: contact details must never be sent in plaintext.
  if(location.hostname === 'devops.toys' && location.protocol !== 'https:') return Promise.reject(new Error('HTTPS required'));
  return fetch('/api/lead', {
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify(payload)
  }).then(function(r){ if(!r.ok) throw new Error(r.status); });
}
leadForm.addEventListener('submit', function(e){
  e.preventDefault();
  if(sending) return;
  var honeypot = leadForm.querySelector('[name="company"]');
  var contact = contactInput.value.trim();
  if(honeypot && honeypot.value){ mForm.hidden = true; mOk.hidden = false; wasOk = true; byId('okClose').focus(); return; }
  if(!contact){
    showErr('form.valEmpty', { field: true }); contactInput.focus(); return;
  }
  if(!looksLikeContact(contact)){
    showErr('form.valErr', { field: true }); contactInput.focus(); return;
  }
  clearErr(); sending = true; mSubmit.disabled = true;
  mSubmitTxt.textContent = t('form.sending');
  sendLead({ contact:contact, language:lang, url:location.href, referrer:document.referrer || '', timestamp:new Date().toISOString() })
    .then(function(){ mForm.hidden = true; mOk.hidden = false; wasOk = true; if(!ovl.hidden && ovl.classList.contains('show')) byId('okClose').focus(); })
    .catch(function(){ showErr('form.err', { mail: true }); if(!ovl.hidden && ovl.classList.contains('show')) contactInput.focus(); })
    .then(function(){ sending = false; mSubmit.disabled = false; mSubmitTxt.textContent = t('form.send'); });
});

/* ================= init ================= */
applyLang(lang);
})();
