(function(){
'use strict';

/* ================= i18n ================= */
var I18N = {
  /* Русский — базовая локаль, и все его строки уже лежат в разметке; они снимаются
     оттуда в BASE при старте (см. ниже). Здесь остаётся только то, чего в разметке
     нет: заголовок документа, meta-описание и тексты состояний формы. */
  ru: {
    'meta.title':"DevOps и FinOps: надёжный продакшен и быстрые релизы | DevOps.toys",
    'meta.desc':"Денис Кузьмин — независимый DevOps / FinOps консультант. Бэкапы и восстановление, CI/CD, оптимизация облачных расходов. Бесплатная диагностика, оплата за результат.",
    'form.sending':'Отправляем…',
    'form.err':'Не удалось отправить заявку. Попробуйте ещё раз или напишите мне напрямую.',
    'form.valEmpty':'Укажите контакт, иначе я не смогу ответить.',
    'form.valErr':'Это не похоже на контакт. Подойдёт email, @телеграм, ссылка на LinkedIn или телефон.',
  },
  en: {
    'skip':'Skip to content',
    'meta.title':"DevOps & FinOps: reliable production and faster releases | DevOps.toys",
    'meta.desc':"Independent DevOps / FinOps consulting: tested recovery, faster CI/CD and lower cloud costs. Free initial audit, payment for results.",
    'nav.services':'Services','nav.process':'How I work','nav.exp':"About me",'nav.faq':'FAQ','nav.contact':'Contact',
    'hero.h1':"Reliable production.<br><em>Faster releases.</em>",
    'hero.lead':"I help founders and development teams improve their infrastructure: test recovery, speed up CI/CD and cut unnecessary cloud costs. Before work starts, we agree on scope, price and a measurable result.",
    'hero.cta1':"Discuss your project",'hero.cta2':"See an audit example",
    'hero.t1':'years in IT','hero.t2':'years in DevOps','hero.t3':"One-off projects or ongoing support",'svc.h':"What I can help you fix",
    'svc.lead':"Start with a single problem. For each task, we agree on what will change and how we will verify the result.",
    'svc.1t':"Faster site and API",'svc.1d':"I examine queries, caching, CDN and backend performance, then fix the bottlenecks.",
    'svc.2t':"Lower cloud spend",'svc.2d':"I review your bill for idle resources, excess capacity and forgotten services.",
    'svc.3t':"Backups and recovery",'svc.3d':"I configure backups and test recovery in a separate environment.",
    'svc.4t':"CI/CD and release speed",'svc.4d':"I find what slows down your pipeline: builds, tests, caching and manual steps.",
    'svc.5t':"Monitoring and alerting",'svc.5d':"I connect metrics and logs, configure alerts and define a clear response procedure.",
    'svc.6t':"AI prototype → production",'svc.6d':"For Lovable, Bolt, Cursor and Claude Code projects, I review deployment, access, data and readiness for load.",'prc.h':"Plan first. Then make changes.",
    'prc.lead':"The audit is free. We agree on scope, price and acceptance criteria before work starts.",'prc.free':'free',
    'prc.1t':'The infrastructure audit','prc.1d':"We agree on the task and required data. I review the selected systems, metrics and costs. This usually takes 1–3 days.",
    'prc.1x1':'Findings report','prc.1x2':'Cost breakdown','prc.1x3':'Priority list',
    'prc.2t':'Report and estimate','prc.2d':"I explain the findings and propose a plan: what changes, what it costs and how we measure the result.",
    'prc.3t':'The work','prc.3d':"I implement the agreed changes. We discuss access, risks, the work window and rollback before implementation.",
    'prc.4t':'Pay for the result','prc.4d':"We verify the result against the agreed criteria. Payment follows acceptance. If I couldn’t help, you pay nothing.",

    'prc.cta':"Start with one task. Describe it when we first speak, and we will define the audit scope.",'exp.h':"Who will work on your system",
    'exp.lead':"I work independently, from the first audit through implementation. Over ten years in IT, six in DevOps and production engineering. Cloud, bare metal and existing infrastructure that needs improvement without an unnecessary rebuild.",
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
    'exp.s9k':'Storage','exp.s9v':'Ceph · MinIO · Amazon S3','faq.h':'Frequently asked',
    'faq.q1':'What does it cost?','faq.a1':"The audit is free. I then quote a specific scope based on the systems involved, access and the complexity of the changes. We fix the price and acceptance criteria before starting. Any scope change requires an updated estimate first.",
    'faq.q2':'How long does the diagnosis take?','faq.a2':"Usually 1–3 days after receiving the agreed access and data. If the task needs a deeper review, we discuss its scope and timeline first.",
    'faq.q3':'Do you need production access?','faq.a3':"Read-only access to metrics, configuration and the cloud bill is usually enough for the audit. Permissions to make changes are agreed separately and limited to the task. Access is granted and revoked under your rules.",
    'faq.q7':"How do support and incident response work?",'faq.a7':"I work independently. Before support starts, we agree on systems, availability hours, response times and escalation. If you need round-the-clock on-call support, coverage and backup arrangements need a separate discussion before we begin.",
    'faq.q4':'We built on Lovable / Bolt / Cursor. Will you take it on?','faq.a4':"Yes. I review what real users will require: deployment, access, data storage, monitoring and load handling. We identify the gaps first, then agree on a launch-readiness plan.",
    'faq.q5':'We have no DevOps engineer. Is that a problem?','faq.a5':"No. I can own an infrastructure task and work with your developers. Before starting, we agree on who approves changes and what your team needs for ongoing operation.",
    'faq.q6':'What if you can’t help?','faq.a6':'I’ll tell you straight after the diagnosis, and you pay nothing. If it isn’t my kind of problem, I’ll point you to someone where I can.','cta.h':"Let’s start with your task",
    'cta.p':"Leave a contact that works for you. I will reply personally, clarify the task and suggest where to start. The initial audit is free.",'cta.btn':"Discuss your project",

    'form.title':'Leave one contact',
    'form.desc':"I will reply personally, clarify the task and agree on the scope of the free audit. It usually takes 1–3 days after receiving the required data.",
    'form.hint':'Email, Telegram, LinkedIn or phone — I’ll reply personally.',
    'form.label':'Your contact','form.ph':'name@example.com or @username',
    'form.send':"Send request",'form.sending':'Sending…',
    'form.ok':'Thanks — I received your request and will contact you.',
    'form.err':'Couldn’t send the request. Please try again, or email me directly.',
    'form.valEmpty':'Enter a contact, otherwise I can’t reply.',
    'form.valErr':'That doesn’t look like a contact. An email, @telegram handle, LinkedIn link or phone number all work.',
    'form.privacy':'Your contact is used only to reply to this request.',
    'form.done':'Done','form.closeAria':'Close dialog',
    'foot.rights':'© 2026 DevOps.toys · DevOps & FinOps consulting',
    'svc.3r':"You get: a test report, measured recovery time and a team runbook.",
    'svc.4r':"Acceptance: before-and-after measurements on comparable runs and a tested rollback procedure.",
    'svc.2r':"Acceptance: verified savings accounting for workload and reliability requirements.",
    'svc.1r':"Acceptance: response-time and error-rate comparisons at an agreed workload.",
    'svc.5r':"You get: dashboards, verified alert delivery and response runbooks.",
    'svc.6r':"You get: fixes and launch verification against an agreed checklist.",
    'audit.h':"What you get from the audit",
    'audit.lead':"A report with findings, priorities and a work plan. This sample entry lets you see the format before getting in touch.",
    'audit.sample':"Illustrative example · no client data",
    'audit.title':"Backups exist. Recovery is unverified.",
    'audit.disclosure':"A sample report entry, not a completed audit. No test results are claimed here.",
    'audit.contextt':"Starting point",
    'audit.contextd':"In this example, backup jobs succeed, but no recovery test report is available.",
    'audit.riskt':"Product risk",
    'audit.riskd':"Recovery time and recoverable data are unknown.",
    'audit.checkt':"Proposed check",
    'audit.checkd':"Restore a selected backup in an isolated environment. Verify data integrity and application startup.",
    'audit.acceptt':"Acceptance criteria",
    'audit.acceptd':"Record recovery time and data freshness. Compare them with the targets agreed before the work.",
    'audit.scopeh':"In your report",
    'audit.evidencet':"Evidence for each finding",
    'audit.evidenced':"What the configuration, metrics and costs show, and what still needs checking.",
    'audit.priorityt':"Priorities",
    'audit.priorityd':"What to fix first, what can wait, and why.",
    'audit.plant':"Plan and estimate",
    'audit.pland':"Scope, price, timeline and acceptance criteria before changes begin.",
    'audit.scope':"We agree on the audit scope for your task. Read-only access to the selected systems is usually enough.",
    'exp.name':"Денис Кузьмин",
    'exp.role':"Independent DevOps / FinOps consultant",
    'formats.h':"One-off work or ongoing support",
    'formats.lead':"The task determines the format. A one-off project does not commit you to ongoing support.",
    'formats.fixt':"A targeted fix",
    'formats.fixd':"One specific bottleneck: a slow build, an untested backup or unnecessary spending.",
    'formats.fixr':"You get a fix, result verification and a description of the changes.",
    'formats.projectt':"An improvement project",
    'formats.projectd':"Several connected tasks: launch preparation, infrastructure improvements or release delivery.",
    'formats.projectr':"Before starting: a plan, milestones, price and acceptance criteria for each stage.",
    'formats.supportt':"Ongoing support",
    'formats.supportd':"Regular work on monitoring, updates, backups and incidents.",
    'formats.supportr':"Scope, availability hours and response times are agreed separately.",
    'faq.q8':"What does my team keep after the work?",
    'faq.a8':"The system remains yours. The plan includes handing over configuration, change descriptions and runbooks for the agreed scope. We decide where these materials live and how they will be handed over before starting."
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
