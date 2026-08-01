(function(){
'use strict';

/* ================= i18n ================= */
var I18N = {
  /* Русский — базовая локаль, и все его строки уже лежат в разметке; они снимаются
     оттуда в BASE при старте (см. ниже). Здесь остаётся только то, чего в разметке
     нет: заголовок документа, meta-описание и тексты состояний формы. */
  ru: {
    'meta.title':'DevOps, FinOps и Production Engineering | DevOps.toys',
    'meta.desc':'Ускорение сайтов, снижение расходов на облако, надёжный production. Диагностика бесплатно — оплата только за результат.',
    'form.sending':'Отправляем…',
    'form.err':'Не удалось отправить заявку. Попробуйте ещё раз или напишите мне напрямую.',
    'form.valErr':'Укажите контакт — не короче 5 символов.',
  },
  en: {
    'skip':'Skip to content',
    'meta.title':'DevOps, FinOps & Production Engineering | DevOps.toys',
    'meta.desc':'Faster sites, lower cloud bills, reliable production. The diagnosis is free — you only pay for results.',
    'nav.services':'Services','nav.process':'How I work','nav.exp':'Experience','nav.faq':'FAQ','nav.contact':'Contact',
    'hero.eyebrow':'DEVOPS · FINOPS · PRODUCTION ENGINEERING',
    'hero.h1':'Faster sites, smaller cloud bills and <em>a production that stays up</em>.',
    'hero.lead':'The diagnosis is free. If I can’t help you, you don’t pay. You’re billed only for results: a faster site, a leaner cloud bill, or stronger reliability.',
    'hero.cta1':'Leave one contact','hero.cta2':'What exactly I do',
    'hero.t1':'years in IT','hero.t2':'years in DevOps','hero.t3':'AWS · Kubernetes · Bare Metal · CI/CD · Observability',

    'cmp.eyebrow':'02 — What changes','cmp.h':'Before and after',
    'cmp.lead':'On the left, infrastructure that can’t keep up with load. On the right, the same system after the work. Drag the handle to compare.',
    'cmp.before':'Before','cmp.after':'After',
    'cmp.live':'· live topology','cmp.sysOk':'system nominal','cmp.sysBad':'system degraded',
    'cmp.lg1':'request flow','cmp.lg2':'redundancy and standby','cmp.lg3':'monitoring probes',
    'cmp.hint':'Drag the slider · the diagram scrolls sideways',
    'cmp.sliderAria':'Comparison: before and after',
    'cmp.beforeTitle':'Infrastructure before the work','cmp.afterTitle':'Infrastructure after the work',
    'cmp.b1':'no CDN','cmp.b2':'single instance','cmp.b3':'no cache','cmp.b4':'no replica',
    'cmp.a1':'CDN at the edge','cmp.a2':'redundant + HA','cmp.a3':'caching','cmp.a4':'replica + backups',
    'cmp.c1t':'CDN and cache','cmp.c1d':'Static files and hot requests are served from the node nearest the user, instead of being pulled from your server every time.',
    'cmp.c2t':'Redundancy at every layer','cmp.c2d':'Load balancers, several application instances and a database replica. One node failing no longer takes the product down.',
    'cmp.c3t':'The database can breathe','cmp.c3d':'The cache absorbs most of the reads, so the database stops being the bottleneck as traffic grows.',
    'cmp.c4t':'Every node monitored','cmp.c4d':'Metrics and alerts across the whole chain. You see degradation on a graph, not in an email from a customer.',

    'n.users':'Users','n.dns':'Internet · DNS','n.cdn':'CDN · Edge','n.lb':'Load balancers',
    'n.frontend':'Frontend','n.backend':'Backend','n.cache':'Cache','n.db':'Database','n.mon':'monitoring',
    'n.dbPrimary':'Primary','n.dbReplica':'Replica','n.db2':'DB',

    'avoid.eyebrow':'03 — Boundaries','avoid.h':'What I won’t do',
    'avoid.lead':'Four things I won’t agree to, even if you ask.',
    'avoid.1':'I won’t sell you a rewrite when a targeted fix will do.',
    'avoid.2':'I won’t push Kubernetes onto a project that doesn’t need it.',
    'avoid.3':'I don’t take payment upfront, and the diagnosis is never billed.',
    'avoid.4':'I don’t lock you into a retainer for a one-off fix.',

    'svc.eyebrow':'01 — Services','svc.h':'What exactly I do',
    'svc.lead':'I take on work where the result can be measured: response time, cloud bill, deploy time, downtime.',
    'svc.1t':'Faster site and API','svc.1d':'CDN, caching, query and backend optimisation. The goal is response times in tens of milliseconds instead of seconds of waiting.',
    'svc.2t':'Lower cloud spend','svc.2d':'I find what you pay for and never use: idle resources, oversized instances, forgotten disks and load balancers.',
    'svc.3t':'Reliability and failover','svc.3d':'Redundancy, database replicas, automatic recovery. One failing node should never take the whole product down.',
    'svc.4t':'CI/CD and release speed','svc.4d':'Pipelines, build caches, parallel steps. From commit to production in minutes instead of hours of manual work.',
    'svc.5t':'Monitoring and alerting','svc.5d':'Metrics, logs and alerts that actually mean something — so you hear about problems before your customers do.',
    'svc.6t':'Production for AI prototypes','svc.6d':'Projects built with Lovable, Bolt, Cursor or Claude Code, taken to a state you can safely open to real users.',

    'prc.eyebrow':'04 — How I work','prc.h':'Four steps, and the first one is free',
    'prc.lead':'No upfront payment and no long discovery phase on your budget.','prc.free':'free',
    'prc.1t':'The infrastructure audit','prc.1d':'I go through your infrastructure, metrics and cloud bill. You get a concrete list of bottlenecks and overspend, not vague talk.',
    'prc.1x1':'Findings report','prc.1x2':'Cost breakdown','prc.1x3':'Priority list',
    'prc.2t':'Report and estimate','prc.2d':'I show you exactly what’s slow and where the money goes — with a work plan, timeline and expected impact.',
    'prc.3t':'The work','prc.3d':'I ship the changes to the agreed plan — no production downtime and no surprises for your team.',
    'prc.4t':'Pay for the result','prc.4d':'You pay once the result is delivered and measured. If I couldn’t help, you pay nothing.',

    'exp.eyebrow':'05 — Experience','exp.h':'Why you can trust me with production',
    'exp.lead':'Ten years in IT, six of them in DevOps and production engineering. I work with both cloud and bare metal: from small SaaS products to systems where downtime is counted in money.',
    'exp.n1':'years in IT','exp.n2':'years in DevOps','exp.n3':'for the diagnosis',
    'exp.s1k':'Orchestration','exp.s1v':'Kubernetes · Amazon EKS · Docker · Helm',
    'exp.s2k':'Cloud and hardware','exp.s2v':'AWS · GCP · OpenStack · bare metal',
    'exp.s3k':'Infrastructure as code','exp.s3v':'Terraform · Ansible',
    'exp.s4k':'GitOps and CI/CD','exp.s4v':'ArgoCD · GitLab CI · GitHub Actions · Jenkins',
    'exp.s5k':'Observability','exp.s5v':'Prometheus · Grafana · Loki · OpenTelemetry',
    'exp.s6k':'Secrets and access','exp.s6v':'Vault · External Secrets · Keycloak · SSO',
    'exp.s7k':'Data and streaming','exp.s7v':'PostgreSQL · Redis · Dragonfly · Kafka',
    'exp.s8k':'Network and delivery','exp.s8v':'Cloudflare · NGINX · HAProxy · CDN',
    'exp.s9k':'Storage','exp.s9v':'Ceph · MinIO · Amazon S3',

    'alt.eyebrow':'06 — Alternatives','alt.h':'What you’re actually comparing this to',
    'alt.lead':'If not me, then what? An honest comparison with what people usually try instead.',
    'alt.colUs':'DevOps.toys','alt.colPrompts':'Fix it yourself with more prompts','alt.colFreelancer':'A cheap freelancer','alt.colNothing':'Do nothing',
    'alt.row1':'Root cause or symptom',
    'alt.row2':'Payment',
    'alt.row3':'Lock-in',
    'alt.row4':'Cost of the diagnosis',
    'alt.v1':'Root cause, clearly identified','alt.p1':'Symptom — you keep patching the same spot','alt.f1':'Depends on who you hired','alt.n1':'The problem stays and grows',
    'alt.v2':'Only for a measured result','alt.p2':'Your time, spent on endless prompts','alt.f2':'Hourly, regardless of outcome','alt.n2':'Technical debt accumulates',
    'alt.v3':'None — the system stays yours','alt.p3':'Dependent on the next prompt','alt.f3':'Dependent on one specific person','alt.n3':'Dependent on luck',
    'alt.v4':'Free','alt.p4':'—','alt.f4':'Often paid','alt.n4':'Free, until it breaks',

    'faq.eyebrow':'07 — FAQ','faq.h':'Frequently asked',
    'faq.q1':'What does it cost?','faq.a1':'The diagnosis is free. I quote the work after it, once the real scope is clear. Payment is tied to the result, not to the hours spent.',
    'faq.q2':'How long does the diagnosis take?','faq.a2':'Usually one to three days. Most of that is waiting on access and data from your side, not the analysis itself.',
    'faq.q3':'Do you need production access?','faq.a3':'For the diagnosis, read-only access is usually enough: metrics, configuration, the cloud bill. Full access only during the work itself, and on your security terms.',
    'faq.q4':'We built on Lovable / Bolt / Cursor. Will you take it on?','faq.a4':'Yes — it’s one of the most common requests. The prototype works, but it isn’t ready for real load, isn’t observable, and won’t survive the first traffic spike. That’s fixable.',
    'faq.q5':'We have no DevOps engineer. Is that a problem?','faq.a5':'No, it’s the usual situation and exactly why people call. I cover that role for the duration of the work and leave the system in a state your team can run without me.',
    'faq.q6':'What if you can’t help?','faq.a6':'I’ll tell you straight after the diagnosis, and you pay nothing. If it isn’t my kind of problem, I’ll point you to someone where I can.',

    'cta.eyebrow':'Next step','cta.h':'Let’s start with the free diagnosis',
    'cta.p':'Leave one contact — email, Telegram, LinkedIn or phone. I’ll look at your system and reply personally.','cta.btn':'Leave one contact',

    'form.title':'Leave one contact','form.desc':'Email, Telegram, LinkedIn or phone — I’ll contact you personally.',
    'form.label':'Your contact','form.ph':'name@example.com or @username',
    'form.send':'Send','form.sending':'Sending…',
    'form.ok':'Thanks — I received your request and will contact you.',
    'form.err':'Couldn’t send the request. Please try again or contact me directly.',
    'form.valErr':'Please enter a contact — at least 5 characters.',
    'form.privacy':'Your contact is used only to reply to this request.',
    'form.done':'Done','form.closeAria':'Close dialog',
    'foot.rights':'© 2026 DevOps.toys · DevOps & FinOps consulting'
  }
};

/* ================= helpers ================= */
function $all(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
function byId(id){ return document.getElementById(id); }
function clamp(v,a,b){ return Math.min(b, Math.max(a, v)); }
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

/* ================= before/after comparison ================= */
var cmpTop = byId('cmpTop'), cmpDiv = byId('cmpDiv'), cmpSlider = byId('cmpSlider');
function syncCmp(){
  var raw = parseInt(cmpSlider.value, 10);
  var v = clamp(isNaN(raw) ? 50 : raw, 0, 100);
  cmpTop.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
  cmpDiv.style.left = v + '%';
  cmpSlider.style.setProperty('--p', v + '%');
}
cmpSlider.addEventListener('input', syncCmp);

/* ================= packet animation =================
   Pooled dots travelling along the SVG route paths. */
var SVGNS = 'http://www.w3.org/2000/svg';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* getPointAtLength() стоит ~0.07 мс и вызывался для каждой точки каждый кадр —
   это 3.9 мс из 16.6 мс бюджета кадра. Пути неподвижны, поэтому сэмплируем каждый
   один раз с шагом ~1px и в кадре только индексируем массив. */
var lutCache = new Map();
function lut(path, len){
  var a = lutCache.get(path);
  if(!a){
    a = [];
    var n = Math.max(2, Math.round(len) || 2);   /* len 0/NaN дал бы пустую таблицу */
    for(var i = 0; i <= n; i++) a.push(path.getPointAtLength(i / n * len));
    lutCache.set(path, a);
  }
  return a;
}

function makePool(host, paths, speed, gap, cap){
  var pool = [], live = [], acc = 0;
  function make(){
    var g = document.createElementNS(SVGNS,'g');
    var halo = document.createElementNS(SVGNS,'circle');
    halo.setAttribute('class','pkt-halo');
    var core = document.createElementNS(SVGNS,'circle');
    core.setAttribute('class','pkt-core');
    g.appendChild(halo); g.appendChild(core);
    host.appendChild(g);
    /* t/len/path/spd не инициализируем: spawn() перезаписывает их сразу же. */
    return { g:g, halo:halo, core:core };
  }
  function kill(p){
    p.g.setAttribute('display','none');
    var i = live.indexOf(p);
    if(i > -1) live.splice(i,1);
    pool.push(p);
  }
  function spawn(){
    var p = pool.pop() || make();
    p.path = paths[Math.floor(Math.random() * paths.length)];
    p.len = p.path.getTotalLength() || 1;        /* 0 на неотрисованном SVG → деление на ноль */
    p.t = 0;
    p.spd = speed * (0.75 + Math.random() * 0.5);
    /* varied radii give the stream visual texture instead of a uniform dotted line */
    var r = 2.2 + Math.random() * 2.4;
    p.core.setAttribute('r', r.toFixed(1));
    p.halo.setAttribute('r', (r * 2).toFixed(1));
    p.g.removeAttribute('display');
    live.push(p);
  }
  /* Fill the lane immediately with packets at random positions. Without this the
     whole batch spawns at t=0 within the first seconds and travels as one clump. */
  function seed(){
    for(var i = 0; i < cap; i++){ spawn(); live[live.length - 1].t = Math.random(); }
  }
  return {
    seed: seed,
    step: function(dt){
      acc += dt * 1000;
      /* тело обнуляет acc, поэтому условие не может выполниться дважды подряд */
      if(acc > gap && live.length < cap){ acc = 0; spawn(); }
      for(var i = live.length - 1; i >= 0; i--){
        var p = live[i];
        p.t += (p.spd * dt) / p.len;
        /* !(p.t < 1) вместо p.t >= 1: NaN тоже отправляется в kill, иначе пакет застревает навсегда */
        if(!(p.t < 1)){ kill(p); }
        else {
          var tbl = lut(p.path, p.len);
          var pt = tbl[Math.round(p.t * (tbl.length - 1))];
          p.g.setAttribute('transform','translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
        }
      }
    }
  };
}

/* Dense streams, matching the reference art: many small dots rather than a few
   large ones. Counts are the ceiling, not the steady state. */
var pools = [
  makePool(byId('pktBefore'), [byId('pBefore')], 95, 380, 22),
  makePool(byId('pktAfter'),  [byId('pA1'),byId('pA2'),byId('pA3')], 150, 260, 28)
];
/* Цикл крутится, только пока виджет на экране и вкладка активна — за пределами
   вьюпорта анимация раньше продолжала считать кадры впустую. */
var cmpVisible = true, running = false, lastT = 0;
function startFrames(){
  if(running || reduced) return;
  running = true;
  lastT = performance.now();
  requestAnimationFrame(frame);
}
function frame(now){
  if(!cmpVisible || document.hidden){ running = false; return; }
  var dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  for(var i = 0; i < pools.length; i++) pools[i].step(dt);
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', function(){ if(!document.hidden) startFrames(); });
if(window.IntersectionObserver){
  var cmpBox = document.querySelector('.cmp');
  if(cmpBox) new IntersectionObserver(function(entries){
    cmpVisible = entries[0].isIntersecting;
    if(cmpVisible) startFrames();
  }, { rootMargin: '100px' }).observe(cmpBox);
}

/* ================= lead modal ================= */
var ovl = byId('ovl'), modal = byId('modal'), page = byId('page');
var leadForm = byId('leadForm'), contactInput = byId('contact');
var fErr = byId('fErr'), mSubmit = byId('mSubmit'), mSubmitTxt = byId('mSubmitTxt');
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
    fErr.textContent = t('form.valErr'); fErr.hidden = false; contactInput.focus(); return;
  }
  fErr.hidden = true; sending = true; mSubmit.disabled = true;
  mSubmitTxt.textContent = t('form.sending');
  sendLead({ contact:contact, language:lang, url:location.href, referrer:document.referrer || '', timestamp:new Date().toISOString() })
    .then(function(){ mForm.hidden = true; mOk.hidden = false; wasOk = true; byId('okClose').focus(); })
    .catch(function(){ fErr.textContent = t('form.err'); fErr.hidden = false; contactInput.focus(); })
    .then(function(){ sending = false; mSubmit.disabled = false; mSubmitTxt.textContent = t('form.send'); });
});

/* ================= init ================= */
applyLang(lang);
syncCmp();
if(!reduced){
  pools.forEach(function(p){ p.seed(); });
  startFrames();
}
})();
