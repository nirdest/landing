(function(){
'use strict';

/* ================= i18n ================= */
var I18N = {
  ru: {
    'skip':'Перейти к содержанию',
    'meta.title':'DevOps, FinOps и Production Engineering | DevOps.toys',
    'meta.desc':'Ускорение сайтов, снижение расходов на облако, надёжный production. Диагностика бесплатно — оплата только за результат.',
    'nav.services':'Услуги','nav.process':'Как я работаю','nav.exp':'Опыт','nav.faq':'Вопросы','nav.contact':'Связаться',
    'hero.eyebrow':'DEVOPS · FINOPS · PRODUCTION ENGINEERING',
    'hero.h1':'Быстрые сайты, меньший счёт за облако и <em>продакшен, который не падает</em>.',
    'hero.lead':'Диагностику проведу бесплатно. Если не смогу помочь — вы не платите. Оплата только за результат: ускорение сайта, оптимизацию бюджета или повышение отказоустойчивости.',
    'hero.cta1':'Оставить контакт','hero.cta2':'Что именно я делаю',
    'hero.t1':'лет в IT','hero.t2':'лет в DevOps','hero.t3':'AWS · Kubernetes · Bare Metal · CI/CD · Observability',

    'cmp.eyebrow':'01 — Что меняется','cmp.h':'Было и стало',
    'cmp.lead':'Слева — инфраструктура, которая не справляется с нагрузкой. Справа — та же система после работы. Потяните ползунок, чтобы сравнить.',
    'cmp.before':'До','cmp.after':'После',
    'cmp.live':'· живая топология','cmp.sysOk':'система в норме','cmp.sysBad':'система деградировала',
    'cmp.lg1':'поток запросов','cmp.lg2':'дублирование и резерв','cmp.lg3':'проверки мониторинга',
    'cmp.hint':'Потяните ползунок · схему можно прокрутить вбок',
    'cmp.sliderAria':'Сравнение: до и после',
    'cmp.beforeTitle':'Инфраструктура до работы','cmp.afterTitle':'Инфраструктура после работы',
    'cmp.b1':'нет CDN','cmp.b2':'один инстанс','cmp.b3':'нет кэша','cmp.b4':'нет реплики',
    'cmp.a1':'CDN на edge','cmp.a2':'резерв и HA','cmp.a3':'кэширование','cmp.a4':'бэкапы и реплика',
    'cmp.c1t':'CDN и кэш','cmp.c1d':'Статика и частые запросы отдаются с ближайшего к пользователю узла, а не тянутся каждый раз с вашего сервера.',
    'cmp.c2t':'Резерв на каждом уровне','cmp.c2d':'Балансировщики, несколько инстансов приложения и реплика базы. Отказ одного узла больше не роняет продукт.',
    'cmp.c3t':'База данных разгружена','cmp.c3d':'Кэш забирает большую часть чтения на себя, и база перестаёт быть узким местом при росте трафика.',
    'cmp.c4t':'Мониторинг всех узлов','cmp.c4d':'Метрики и алерты по всей цепочке. О деградации вы узнаёте по графику, а не из письма клиента.',

    'n.users':'Пользователи','n.dns':'Интернет · DNS','n.cdn':'CDN · Edge','n.lb':'Балансировщики',
    'n.frontend':'Фронтенд','n.backend':'Бэкенд','n.cache':'Кэш','n.db':'База данных','n.mon':'мониторинг',
    'n.dbPrimary':'Основная','n.dbReplica':'Реплика','n.db2':'БД',

    'avoid.eyebrow':'02 — Границы','avoid.h':'Чего я не делаю',
    'avoid.lead':'Четыре вещи, на которые я не соглашусь, даже если попросите.',
    'avoid.1':'Не продаю переписывание с нуля, если хватит точечного фикса.',
    'avoid.2':'Не тащу Kubernetes туда, где хватит одного сервера.',
    'avoid.3':'Не беру предоплату и не выставляю счёт за диагностику.',
    'avoid.4':'Не подсаживаю на постоянный ретейнер, если задача разовая.',

    'svc.eyebrow':'03 — Услуги','svc.h':'Что именно я делаю',
    'svc.lead':'Беру задачи, где результат можно измерить: время ответа, счёт за облако, время выкатки, время простоя.',
    'svc.1t':'Ускорение сайта и API','svc.1d':'CDN, кэширование, оптимизация запросов и бэкенда. Цель — время ответа в десятки миллисекунд вместо секунд ожидания.',
    'svc.2t':'Снижение расходов на облако','svc.2d':'Нахожу то, за что вы платите зря: простаивающие ресурсы, переразмеренные инстансы, забытые диски и балансировщики.',
    'svc.3t':'Отказоустойчивость','svc.3d':'Резервирование, реплики базы, автоматическое восстановление. Падение одного узла не должно ронять весь продукт.',
    'svc.4t':'CI/CD и скорость релизов','svc.4d':'Пайплайны, кэш сборок, параллельные шаги. От коммита до продакшена — минуты вместо часов и ручных действий.',
    'svc.5t':'Мониторинг и алерты','svc.5d':'Метрики, логи и осмысленные оповещения. Чтобы о проблеме вы узнавали раньше, чем о ней напишут клиенты.',
    'svc.6t':'Продакшен для AI-прототипов','svc.6d':'Проекты на Lovable, Bolt, Cursor или Claude Code довожу до состояния, в котором их не страшно открыть пользователям.',

    'prc.eyebrow':'04 — Как я работаю','prc.h':'Четыре шага, первый — бесплатный',
    'prc.lead':'Никакой предоплаты и долгих обследований за ваш счёт.','prc.free':'бесплатно',
    'prc.1t':'Инфраструктурный аудит','prc.1d':'Смотрю инфраструктуру, метрики и счёт за облако. На выходе — конкретный список узких мест и переплат, а не общие слова.',
    'prc.1x1':'Отчёт с находками','prc.1x2':'Разбивка расходов','prc.1x3':'Список приоритетов',
    'prc.2t':'Отчёт и оценка','prc.2d':'Показываю, что именно тормозит и куда уходят деньги. С планом работ, сроками и ожидаемым эффектом.',
    'prc.3t':'Работа','prc.3d':'Внедряю изменения по согласованному плану — без простоя продакшена и без сюрпризов для вашей команды.',
    'prc.4t':'Оплата за результат','prc.4d':'Платите, когда результат достигнут и измерен. Если помочь не смог — не платите ничего.',

    'exp.eyebrow':'05 — Опыт','exp.h':'Почему мне можно доверить продакшен',
    'exp.lead':'Восемь лет в IT, пять из них — в DevOps и production engineering. Работаю и с облаком, и с железом: от небольших SaaS до систем, где простой считают в деньгах.',
    'exp.n1':'лет в IT','exp.n2':'лет в DevOps','exp.n3':'за диагностику',
    'exp.s1k':'Облако и железо','exp.s1v':'AWS · Bare metal · VPS',
    'exp.s2k':'Оркестрация','exp.s2v':'Kubernetes · Docker',
    'exp.s3k':'Доставка','exp.s3v':'CI/CD · GitHub Actions · GitLab CI',
    'exp.s4k':'Наблюдаемость','exp.s4v':'Prometheus · Grafana · логи · алерты',
    'exp.s5k':'Инфраструктура как код','exp.s5v':'Terraform · Ansible',

    'alt.eyebrow':'06 — Альтернативы','alt.h':'С чем вы на самом деле сравниваете',
    'alt.lead':'Если не я — то что? Честное сравнение с тем, что обычно пробуют вместо этого.',
    'alt.colUs':'DevOps.toys','alt.colPrompts':'Чинить самому промптами','alt.colFreelancer':'Дешёвый фрилансер','alt.colNothing':'Ничего не делать',
    'alt.row1':'Причина или симптом',
    'alt.row2':'Оплата',
    'alt.row3':'Зависимость (lock-in)',
    'alt.row4':'Стоимость диагностики',
    'alt.v1':'Причина — с чёткой первопричиной','alt.p1':'Симптом — правите одно и то же место','alt.f1':'Зависит от исполнителя','alt.n1':'Проблема остаётся и растёт',
    'alt.v2':'Только за измеренный результат','alt.p2':'Ваше время на бесконечные правки','alt.f2':'Почасово, независимо от исхода','alt.n2':'Технический долг копится',
    'alt.v3':'Нет — система остаётся вашей','alt.p3':'Зависимость от новых промптов','alt.f3':'Зависимость от конкретного человека','alt.n3':'Зависимость от везения',
    'alt.v4':'Бесплатно','alt.p4':'—','alt.f4':'Часто платно','alt.n4':'Бесплатно, пока не упадёт',

    'faq.eyebrow':'07 — Вопросы','faq.h':'Частые вопросы',
    'faq.q1':'Сколько это стоит?','faq.a1':'Диагностика бесплатна. Стоимость работ называю после неё — когда понятен реальный объём. Оплата привязана к результату, а не к количеству потраченных часов.',
    'faq.q2':'Сколько занимает диагностика?','faq.a2':'Обычно один-три дня. Основное время уходит не на анализ, а на получение доступов и данных с вашей стороны.',
    'faq.q3':'Нужен ли вам доступ к продакшену?','faq.a3':'Для диагностики, как правило, хватает доступа на чтение: метрики, конфигурация, счёт за облако. Полный доступ — только на этапе работ и по вашим правилам безопасности.',
    'faq.q4':'У нас проект на Lovable / Bolt / Cursor. Возьмётесь?','faq.a4':'Да, это один из самых частых запросов. Прототип собран и работает, но не готов к реальной нагрузке, не наблюдаем и не переживёт первый всплеск трафика. Это решаемо.',
    'faq.q5':'У нас нет DevOps-инженера. Это проблема?','faq.a5':'Нет, это обычная ситуация и как раз повод обратиться. Я закрываю эту роль на время работ и оставляю систему в состоянии, которым сможет управлять ваша команда без меня.',
    'faq.q6':'А если вы не сможете помочь?','faq.a6':'Скажу об этом прямо по итогам диагностики, и вы ничего не заплатите. Если задача не моя — по возможности подскажу, к кому с ней идти.',

    'cta.eyebrow':'Следующий шаг','cta.h':'Начнём с бесплатной диагностики',
    'cta.p':'Оставьте один контакт — email, Telegram, LinkedIn или телефон. Посмотрю вашу систему и отвечу лично.','cta.btn':'Оставить контакт',

    'form.title':'Оставьте один контакт','form.desc':'Email, Telegram, LinkedIn или телефон — я свяжусь с вами лично.',
    'form.label':'Ваш контакт','form.ph':'name@example.com или @username',
    'form.send':'Отправить','form.sending':'Отправляем…',
    'form.ok':'Спасибо — я получил заявку и свяжусь с вами.',
    'form.err':'Не удалось отправить заявку. Попробуйте ещё раз или напишите мне напрямую.',
    'form.valErr':'Укажите контакт — не короче 5 символов.',
    'form.privacy':'Контакт будет использован только для ответа на эту заявку.',
    'form.done':'Готово','form.closeAria':'Закрыть окно',
    'foot.rights':'© 2026 DevOps.toys · Консалтинг DevOps и FinOps'
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

    'cmp.eyebrow':'01 — What changes','cmp.h':'Before and after',
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

    'avoid.eyebrow':'02 — Boundaries','avoid.h':'What I won’t do',
    'avoid.lead':'Four things I won’t agree to, even if you ask.',
    'avoid.1':'I won’t sell you a rewrite when a targeted fix will do.',
    'avoid.2':'I won’t push Kubernetes onto a project that doesn’t need it.',
    'avoid.3':'I don’t take payment upfront, and the diagnosis is never billed.',
    'avoid.4':'I don’t lock you into a retainer for a one-off fix.',

    'svc.eyebrow':'03 — Services','svc.h':'What exactly I do',
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
    'exp.lead':'Eight years in IT, five of them in DevOps and production engineering. I work with both cloud and bare metal: from small SaaS products to systems where downtime is counted in money.',
    'exp.n1':'years in IT','exp.n2':'years in DevOps','exp.n3':'for the diagnosis',
    'exp.s1k':'Cloud and hardware','exp.s1v':'AWS · Bare metal · VPS',
    'exp.s2k':'Orchestration','exp.s2v':'Kubernetes · Docker',
    'exp.s3k':'Delivery','exp.s3v':'CI/CD · GitHub Actions · GitLab CI',
    'exp.s4k':'Observability','exp.s4v':'Prometheus · Grafana · logs · alerts',
    'exp.s5k':'Infrastructure as code','exp.s5v':'Terraform · Ansible',

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
function t(k){ return (I18N[lang] && I18N[lang][k]) || I18N.ru[k] || k; }

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
var tabHidden = document.hidden;
document.addEventListener('visibilitychange', function(){ tabHidden = document.hidden; });

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
    return { g:g, halo:halo, core:core, t:0, len:1, path:paths[0], spd:speed };
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
    p.len = p.path.getTotalLength();
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
      if(reduced || tabHidden) return;
      acc += dt * 1000;
      while(acc > gap && live.length < cap){ acc = 0; spawn(); }
      for(var i = live.length - 1; i >= 0; i--){
        var p = live[i];
        p.t += (p.spd * dt) / p.len;
        if(p.t >= 1){ kill(p); }
        else {
          var pt = p.path.getPointAtLength(p.t * p.len);
          p.g.setAttribute('transform','translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
        }
      }
    },
    hide: function(){ while(live.length) kill(live[0]); host.setAttribute('display','none'); }
  };
}

/* Dense streams, matching the reference art: many small dots rather than a few
   large ones. Counts are the ceiling, not the steady state. */
var pools = [
  makePool(byId('pktBefore'), [byId('pBefore')], 95, 380, 22),
  makePool(byId('pktAfter'),  [byId('pA1'),byId('pA2'),byId('pA3')], 150, 260, 28)
];
if(reduced) pools.forEach(function(p){ p.hide(); });
else pools.forEach(function(p){ p.seed(); });

var lastT = performance.now();
function frame(now){
  var dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  for(var i = 0; i < pools.length; i++) pools[i].step(dt);
  requestAnimationFrame(frame);
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
  /* PRODUCTION: POST payload to /api/lead (Turnstile validated server-side, Resend sends the email). */
  void payload;
  return new Promise(function(resolve){ setTimeout(resolve, 800); });
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
lastT = performance.now();
requestAnimationFrame(frame);
})();
