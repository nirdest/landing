(function(){
'use strict';
/* Движение страницы. Прятать контент имеет право только этот скрипт и только
   через .is-pending: отключённый JS, ошибка, отсутствие IntersectionObserver
   или prefers-reduced-motion оставляют всё видимым. Приход героя — чистый CSS. */

/* ============ header hairline ============ */
var hdr = document.getElementById('hdr');
if (hdr) {
  var onScroll = function(){ hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============ statement words ============ */
/* Слова подсвечиваются по скроллу через animation-timeline: view() в CSS;
   здесь только нарезка на <span class="w">. Без поддержки — просто текст. */
var say = document.querySelector('.big-say');
function splitWords(){
  if (!say) return;
  var words = say.textContent.trim().split(/[ \t\n]+/);
  say.innerHTML = '';
  words.forEach(function(w, i){
    var s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    s.style.setProperty('--i', i);
    say.appendChild(s);
    if (i < words.length - 1) say.appendChild(document.createTextNode(' '));
  });
}
splitWords();
document.addEventListener('langchange', splitWords);

/* ============ ai pill ============ */
/* Курсор рядом — кнопка тянется к нему (не дальше 18px), ушёл — возвращается. */
var pill = document.getElementById('aiPill');
if (pill && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', function(e){
    var r = pill.getBoundingClientRect();
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    var d = Math.sqrt(dx * dx + dy * dy), k = d < 220 ? 18 * (1 - d / 220) / (d || 1) : 0;
    pill.style.setProperty('--mx', (dx * k).toFixed(1) + 'px');
    pill.style.setProperty('--my', (dy * k).toFixed(1) + 'px');
  }, { passive: true });
}

/* ============ scroll reveals ============ */
if (!window.IntersectionObserver) return;
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

try {
  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var alive = false;
  var io = new IntersectionObserver(function(entries){
    alive = true;
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      e.target.classList.add('is-in');
      e.target.classList.remove('is-pending');
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

  items.forEach(function(el){
    /* То, что уже на экране при загрузке, не прячем — это было бы миганием. */
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    /* Соседи в одном списке приходят лесенкой, а не разом. */
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', (Math.min(sib, 6) * 0.06) + 's');
    el.classList.add('is-pending');
    io.observe(el);
  });

  /* Страховка: наблюдатель так и не позвонил ни разу — показываем всё. */
  setTimeout(function(){
    if (alive) return;
    items.forEach(function(el){ el.classList.remove('is-pending'); });
  }, 3000);
} catch (e) {
  Array.prototype.forEach.call(document.querySelectorAll('.is-pending'), function(el){ el.classList.remove('is-pending'); });
}
})();
