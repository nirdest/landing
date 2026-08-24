(function(){
'use strict';

/* Прогрессивное улучшение по построению: ни один элемент не получает
   opacity:0 из CSS сам по себе. Классы, которые прячут содержимое
   (.is-timed), ставит только этот скрипт — если он не выполнился или у
   посетителя reduce-motion, страница просто видна целиком. */
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= hero ================= */
/* Тихий приход, а не вторая сцена: авторский момент на странице один, и он
   ниже — в логе. Здесь только opacity и небольшой сдвиг. */
if (typeof gsap !== 'undefined' && !reduced) {
  var heroKids = document.querySelectorAll(
    '.hero .h1, .hero .lead, .hero .ai-badge-row, .hero .cta-row, .hero .hero-trust');
  if (heroKids.length) {
    gsap.from(heroKids, {
      opacity: 0, y: 10, duration: 0.5, ease: 'expo.out', stagger: 0.06
    });
  }
}

/* ================= фокусная сцена: лог печатает себя ================= */
/* Расписание живёт в разметке (data-t на строке, в миллисекундах) и сжато из
   реальных таймстампов лога. Правая колонка закрывает аварию к 720 мс и
   замолкает; левая после 480 мс молчит до 2350 мс. Эта пауза — те самые
   часы, которых никто не заметил, и в ней весь аргумент секции.

   Сдвига макета нет: строки занимают своё место с самого начала, гаснет
   только непрозрачность. */
var logs = document.querySelector('.logs');
if (logs) {
  var rows = Array.prototype.slice.call(logs.querySelectorAll('[data-t]'));

  var revealAll = function(){
    rows.forEach(function(el){ el.classList.add('is-in'); });
    Array.prototype.forEach.call(logs.querySelectorAll('.term'), function(t){
      t.style.setProperty('--pending', 0);
      t.classList.remove('is-writing');
    });
  };

  if (!reduced && rows.length) {
    logs.classList.add('is-timed');
    Array.prototype.forEach.call(logs.querySelectorAll('.term'), function(term){
      term.style.setProperty('--pending', term.querySelectorAll('.log-row').length);
    });
    var timers = [], played = false;

    var play = function(){
      if (played) return;
      played = true;
      try {
        Array.prototype.forEach.call(logs.querySelectorAll('.term'), function(term){
          term.classList.add('is-writing');
          var last = term.querySelectorAll('[data-t]');
          last = last[last.length - 1];
          var end = last ? (parseInt(last.getAttribute('data-t'), 10) || 0) : 0;
          timers.push(setTimeout(function(){ term.classList.remove('is-writing'); }, end));
        });
        rows.forEach(function(el){
          var t = parseInt(el.getAttribute('data-t'), 10);
          timers.push(setTimeout(function(){
            el.classList.add('is-in');
            /* каретка идёт следом за выводом, а не ждёт на дне окна */
            var term = el.closest('.term');
            if (term) {
              var pending = term.querySelectorAll('.log-row:not(.is-in)').length;
              term.style.setProperty('--pending', pending);
            }
          }, isNaN(t) ? 0 : t));
        });
      } catch (e) {
        /* Сцена — украшение, содержимое лога — нет: любой сбой внутри
           показывает все строки, а не оставляет секцию пустой. */
        timers.forEach(clearTimeout);
        revealAll();
      }
    };

    /* Страховка: если по какой-то причине наблюдатель так и не сработал,
       через 6 секунд после загрузки лог показывается всё равно. */
    setTimeout(function(){ if (!played) { played = true; revealAll(); } }, 6000);

    if (window.IntersectionObserver) {
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          /* мигание каретки — незначащий цикл, за экраном он не крутится */
          logs.classList.toggle('is-onscreen', e.isIntersecting);
          if (e.isIntersecting) play();
        });
      }, { threshold: 0.25 }).observe(logs);
    } else {
      logs.classList.add('is-onscreen');
      play();
    }
  } else if (window.IntersectionObserver) {
    /* При reduce-motion лог виден сразу, но каретку всё равно не крутим
       за пределами экрана. */
    new IntersectionObserver(function(entries){
      logs.classList.toggle('is-onscreen', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(logs);
  }
}
})();
