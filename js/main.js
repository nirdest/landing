(function(){
'use strict';

/* ================= i18n ================= */
var I18N = {
  /* Русский — базовая локаль, и все его строки уже лежат в разметке; они снимаются
     оттуда в BASE при старте (см. ниже). Здесь остаётся только то, чего в разметке
     нет: заголовок документа, meta-описание и тексты состояний формы. */
  ru: {
    'meta.title':'Инфраструктура, о которой не надо думать | DevOps.toys',
    'meta.desc':'Забираю IT-инфраструктуру на себя: бэкапы, отказоустойчивость, быстрое восстановление после сбоя. Разово или на постоянной основе. Диагностика бесплатно.',
    'form.sending':'Отправляем…',
    'form.err':'Не удалось отправить заявку. Попробуйте ещё раз или напишите мне напрямую.',
    'form.valErr':'Укажите контакт — не короче 5 символов.',
  },
  en: {
    'skip':'Skip to content',
    'meta.title':'Infrastructure you never have to think about | DevOps.toys',
    'meta.desc':'I take your IT infrastructure off your hands: backups, failover, fast recovery. One-off or ongoing. The diagnosis is free.',
    'nav.services':'Services','nav.process':'How I work','nav.exp':'Experience','nav.faq':'FAQ','nav.contact':'Contact',
    'hero.h1':'Infrastructure you’ll <em>never have to think about</em> again.',
    'hero.lead':'Backups, failover, fast recovery after an outage — your data and your customers are protected, whatever happens. A targeted fix, a rebuild, or ongoing management: I pick the form, you pay for the outcome.',
    'hero.ai':'AI prototypes in production:',
    'hero.cta1':'Get the free audit','hero.cta2':'What exactly I take on',
    'hero.t1':'years in IT','hero.t2':'years in DevOps','hero.t3':'AWS · Kubernetes · Bare Metal · CI/CD · Observability','cmp.h':'The same night. Two infrastructures.',
    'cmp.lead':'At two in the morning the database failed. One log is that night with nobody watching the infrastructure. The other is the same night with me watching.',
    'cmp.sysOk':'system nominal','cmp.sysBad':'degraded',
    'log.you':'you',
    'log.b1':'connection pool exhausted',
    'log.b2':'502 Bad Gateway ×214',
    'log.b3':'— silence, no alerts',
    'log.b4':'“is the site down since yesterday?”',
    'log.b5':'last backup: 23 days ago',
    'log.b6':'a day of leads lost',
    'log.bsum':'downtime: 7 h 48 min',
    'log.a1':'primary unreachable',
    'log.a2':'failover to replica — ok (7 s)',
    'log.a3':'200 OK — customers noticed nothing',
    'log.a4':'alert went to me, not to you',
    'log.a5':'backup done and verified',
    'log.a6':'— an ordinary working morning',
    'log.asum':'downtime: 0 min',
    'cmp.c1t':'Backups that are actually tested','cmp.c1d':'A backup without a tested restore is hope, not a backup. I run the restore regularly, so that on the day it matters it actually works.',
    'cmp.c2t':'Redundancy at every layer','cmp.c2d':'Load balancers, several application instances and a database replica. One node failing no longer takes the product down.',
    'cmp.c3t':'Your customer data is safe','cmp.c3d':'Data and leads survive the loss of the primary server: the replica and the backups live somewhere else entirely.',
    'cmp.c4t':'I deal with it, not you','cmp.c4d':'Metrics and alerts across the whole chain, wired so that I hear about a problem first. It reaches you with a fix attached — or it never reaches you at all.','avoid.h':'What I won’t do',
    'avoid.lead':'Four things I won’t agree to, even if you ask.',
    'avoid.1':'I won’t sell you a rewrite when a targeted fix will do.',
    'avoid.2':'I won’t push Kubernetes onto a project that doesn’t need it.',
    'avoid.3':'I don’t take payment upfront, and the diagnosis is never billed.',
    'avoid.4':'I don’t lock you into a retainer for a one-off fix.','svc.h':'What exactly I take on',
    'svc.lead':'Everything that turns infrastructure into your problem. The result stays measurable: response time, cloud bill, deploy time, downtime.',
    'svc.1t':'Faster site and API','svc.1d':'CDN, caching, query and backend optimisation. The goal is response times in tens of milliseconds instead of seconds of waiting.',
    'svc.2t':'Lower cloud spend','svc.2d':'I find what you pay for and never use: idle resources, oversized instances, forgotten disks and load balancers.',
    'svc.3t':'Backups and recovery','svc.3d':'Regular backups, database replicas and redundancy at every layer. I don’t just configure the restore — I test it, so your customer data survives any outage.',
    'svc.4t':'CI/CD and release speed','svc.4d':'Pipelines, build caches, parallel steps. From commit to production in minutes instead of hours of manual work.',
    'svc.5t':'Monitoring and alerting','svc.5d':'Metrics, logs and alerts that actually mean something. I hear about a problem first — before your customers, and before you.',
    'svc.6t':'Production for AI prototypes','svc.6d':'Projects built with Lovable, Bolt, Cursor or Claude Code, taken to a state you can safely open to real users.','prc.h':'Four steps, and the first one is free',
    'prc.lead':'No upfront payment and no long discovery phase on your budget.','prc.free':'free',
    'prc.1t':'The infrastructure audit','prc.1d':'I go through your infrastructure, metrics and cloud bill. You get a concrete list of bottlenecks and overspend, not vague talk.',
    'prc.1x1':'Findings report','prc.1x2':'Cost breakdown','prc.1x3':'Priority list',
    'prc.2t':'Report and estimate','prc.2d':'I show you exactly what hurts and where the money goes — with a work plan, timeline and expected impact.',
    'prc.3t':'The work','prc.3d':'I ship the changes to the agreed plan — no production downtime and no surprises for your team.',
    'prc.4t':'Pay for the result','prc.4d':'You pay once the result is delivered and measured. If I couldn’t help, you pay nothing.',
    /* Не шаг, а развилка после работы: заголовок секции обещает четыре шага,
       поэтому пятая карточка нумерации не получает. */
    'prc.5n':'after','prc.5t':'Then — whatever suits you','prc.5d':'We can close the job and part ways: the system stays yours and your team runs it. Or you leave the infrastructure with me on a monthly basis — and stop dealing with administration entirely.','exp.h':'Why you can trust me with production',
    'exp.lead':'Ten years in IT, six of them in DevOps and production engineering. I work with both cloud and bare metal: from small SaaS products to systems where downtime is counted in money.',
    'exp.n1':'years in IT','exp.n2':'years in DevOps','exp.n3':'for the diagnosis',
    /* Значение целиком, а не только цифра: рублёвый знак не переводится и в
       английской версии читался как «0 ₽ for the diagnosis». */
    'exp.n3v':'0',
    'exp.s1k':'Orchestration','exp.s1v':'Kubernetes · Amazon EKS · Docker · Helm',
    'exp.s2k':'Cloud and hardware','exp.s2v':'AWS · GCP · OpenStack · bare metal',
    'exp.s3k':'Infrastructure as code','exp.s3v':'Terraform · Ansible',
    'exp.s4k':'GitOps and CI/CD','exp.s4v':'ArgoCD · GitLab CI · GitHub Actions · Jenkins',
    'exp.s5k':'Observability','exp.s5v':'Prometheus · Grafana · Loki · OpenTelemetry',
    'exp.s6k':'Secrets and access','exp.s6v':'Vault · External Secrets · Keycloak · SSO',
    'exp.s7k':'Data and streaming','exp.s7v':'PostgreSQL · Redis · Dragonfly · Kafka',
    'exp.s8k':'Network and delivery','exp.s8v':'Cloudflare · NGINX · HAProxy · CDN',
    'exp.s9k':'Storage','exp.s9v':'Ceph · MinIO · Amazon S3','alt.h':'What you’re actually comparing this to',
    'alt.lead':'If not me, then what? An honest comparison with what people usually try instead.',
    'alt.hint':'The table scrolls sideways',
    'alt.colUs':'DevOps.toys','alt.colPrompts':'Fix it yourself with more prompts','alt.colFreelancer':'A cheap freelancer','alt.colNothing':'Do nothing',
    'alt.row1':'Root cause or symptom',
    'alt.row2':'Payment',
    'alt.row3':'Lock-in',
    'alt.row4':'Cost of the diagnosis',
    'alt.v1':'Root cause, clearly identified','alt.p1':'Symptom — you keep patching the same spot','alt.f1':'Depends on who you hired','alt.n1':'The problem stays and grows',
    'alt.v2':'Only for a measured result','alt.p2':'Your time, spent on endless prompts','alt.f2':'Hourly, regardless of outcome','alt.n2':'Technical debt accumulates',
    'alt.v3':'None — the system stays yours','alt.p3':'Dependent on the next prompt','alt.f3':'Dependent on one specific person','alt.n3':'Dependent on luck',
    'alt.v4':'Free','alt.p4':'—','alt.f4':'Often paid','alt.n4':'Free, until it breaks','faq.h':'Frequently asked',
    'faq.q1':'What does it cost?','faq.a1':'The diagnosis is free. I quote the work after it, once the real scope is clear. Payment is tied to the result, not to the hours spent.',
    'faq.q2':'How long does the diagnosis take?','faq.a2':'Usually one to three days. Most of that is waiting on access and data from your side, not the analysis itself.',
    'faq.q3':'Do you need production access?','faq.a3':'For the diagnosis, read-only access is usually enough: metrics, configuration, the cloud bill. Full access only during the work itself, and on your security terms.',
    'faq.q7':'Can we hand the infrastructure to you for good?','faq.a7':'Yes. After the first round of work we can move to a monthly arrangement: I watch the system, patch it, fix it and own the backups, and you simply stop thinking about administration. It isn’t a condition — a one-off job is a perfectly normal outcome too.',
    'faq.q4':'We built on Lovable / Bolt / Cursor. Will you take it on?','faq.a4':'Yes — it’s one of the most common requests. The prototype works, but it isn’t ready for real load, isn’t observable, and won’t survive the first traffic spike. That’s fixable.',
    'faq.q5':'We have no DevOps engineer. Is that a problem?','faq.a5':'No, it’s the usual situation and exactly why people call. I cover that role for the duration of the work and leave the system in a state your team can run without me.',
    'faq.q6':'What if you can’t help?','faq.a6':'I’ll tell you straight after the diagnosis, and you pay nothing. If it isn’t my kind of problem, I’ll point you to someone where I can.','cta.h':'Let’s start with the free diagnosis',
    'cta.p':'Leave one contact — email, Telegram, LinkedIn or phone. I’ll look at your system and reply personally.','cta.btn':'Get the free audit',

    'form.title':'Leave one contact',
    'form.desc':'The diagnosis is free and takes one to three days. Read-only access is usually enough. If I can’t help, you pay nothing.',
    'form.hint':'Email, Telegram, LinkedIn or phone — I’ll reply personally.',
    'form.label':'Your contact','form.ph':'name@example.com or @username',
    'form.send':'Get the free audit','form.sending':'Sending…',
    'form.ok':'Thanks — I received your request and will contact you.',
    'form.err':'Couldn’t send the request. Please try again, or email me directly.',
    'form.valErr':'Please enter a contact — at least 5 characters.',
    'form.privacy':'Your contact is used only to reply to this request.',
    'form.done':'Done','form.closeAria':'Close dialog',
    'foot.rights':'© 2026 DevOps.toys · DevOps & FinOps consulting'
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
function showErr(key, withMail){
  fErrMsg.textContent = t(key);
  fErrMail.hidden = !withMail;
  fErr.hidden = false;
}
var mForm = byId('mForm'), mOk = byId('mOk');
var lastFocus = null, sending = false, wasOk = false;

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
  lastFocus = document.activeElement;
  ovl.hidden = false;
  requestAnimationFrame(function(){ ovl.classList.add('show'); });
  page.setAttribute('inert','');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', modalKey);
  setTimeout(function(){ contactInput.focus(); }, 60);
}
function closeModal(){
  ovl.classList.remove('show');
  document.removeEventListener('keydown', modalKey);
  page.removeAttribute('inert');
  document.body.style.overflow = '';
  setTimeout(function(){
    ovl.hidden = true;
    if(wasOk){ wasOk = false; mOk.hidden = true; mForm.hidden = false; leadForm.reset(); fErr.hidden = true; }
  }, 230);
  if(lastFocus) lastFocus.focus();
}
$all('.js-open').forEach(function(b){ b.addEventListener('click', openModal); });
byId('mClose').addEventListener('click', closeModal);
byId('okClose').addEventListener('click', closeModal);
ovl.addEventListener('mousedown', function(e){ if(e.target === ovl) closeModal(); });

function sendLead(payload){
  /* Cloudflare Worker на devops.toys/api/lead (см. worker/lead.js) шлёт письмо владельцу. */
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
  if(contact.length < 5 || contact.length > 200){
    showErr('form.valErr', false); contactInput.focus(); return;
  }
  fErr.hidden = true; sending = true; mSubmit.disabled = true;
  mSubmitTxt.textContent = t('form.sending');
  sendLead({ contact:contact, language:lang, url:location.href, referrer:document.referrer || '', timestamp:new Date().toISOString() })
    .then(function(){ mForm.hidden = true; mOk.hidden = false; wasOk = true; byId('okClose').focus(); })
    .catch(function(){ showErr('form.err', true); contactInput.focus(); })
    .then(function(){ sending = false; mSubmit.disabled = false; mSubmitTxt.textContent = t('form.send'); });
});

/* ================= init ================= */
applyLang(lang);
})();
