(function(){
'use strict';
/* Единственная поставленная сцена страницы: пример отчёта заполняется сам,
   сверху вниз, когда до него доскроллили. Это доказательство вместо кейсов, и
   оно должно читаться как документ, который пишут.

   Скрывать строки имеет право ТОЛЬКО этот скрипт: в CSS нет ни одного
   opacity: 0 без классов .is-writing / .is-playing. Поэтому отключённый JS,
   ошибка внутри, отсутствующий IntersectionObserver и prefers-reduced-motion
   одинаково оставляют отчёт целиком видимым — украшение падать может,
   содержимое отчёта нет. */
var report = document.querySelector('#audit .report-body');
if (!report || !window.IntersectionObserver) return;
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

var rows = report.querySelectorAll('.sample-label, h3, .report-disclosure, .fnd, .report-foot, .report-plan');
if (rows.length < 2) return;

/* Если отчёт виден уже при загрузке (высокий экран, переход по якорю,
   восстановленная позиция скролла) — сцены нет: прятать то, на что человек
   уже смотрит, значит мигнуть ему пустой рамкой. */
if (report.getBoundingClientRect().top < window.innerHeight) return;

try {
  for (var i = 0; i < rows.length; i++) {
    rows[i].classList.add('w-row');
    rows[i].style.setProperty('--i', i);
  }
  report.classList.add('is-writing');

  var done = function(){
    report.classList.remove('is-writing');
    report.classList.remove('is-playing');
  };
  /* Страховка на случай, если наблюдатель почему-то не сработает:
     через 6 с отчёт показывается целиком независимо от сцены. */
  var failsafe = setTimeout(done, 6000);

  var io = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    clearTimeout(failsafe);
    /* is-writing снимается ровно в этот момент: пока он висит, базовое
       значение строки — opacity: 0, и анимация интерполировала бы 0 → 0.
       Пропуска кадра нет, backwards-fill держит строку скрытой до её
       задержки. */
    report.classList.remove('is-writing');
    report.classList.add('is-playing');
    setTimeout(done, 380 + rows.length * 55 + 120);
    /* Порог по доле площади тут не годится: окно отчёта выше экрана, и «15%
       видимости» набирается, когда пустая рамка уже несколько сотен
       миллисекунд стоит на экране. Считаем от верхнего края — печать
       начинается ровно тогда, когда окно въезжает в кадр. */
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  io.observe(report);
} catch (e) {
  report.classList.remove('is-writing');
  report.classList.remove('is-playing');
}
})();
