(function(){
'use strict';

/* Progressive enhancement only: nothing here sets an initial opacity in CSS,
   so if GSAP fails to load or the visitor has reduced motion set, the page is
   simply visible already — there is no broken/invisible fallback state. */
if (typeof gsap === 'undefined') return;
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

/* Одно авторское движение на всю страницу — раскрытие hero на загрузке.
   Раньше та же самая связка opacity+y висела ещё и на каждой .sec через
   ScrollTrigger: одинаковый въезд, повторённый девять раз, читается как
   шаблон, а не как решение, и заодно прятал всё ниже первого экрана,
   пока страницу не прокрутят. ScrollTrigger больше не нужен. */
var heroKids = document.querySelectorAll(
  '.hero .h1, .hero .lead, .hero .ai-badge-row, .hero .cta-row, .hero .hero-trust');

if (heroKids.length) {
  gsap.from(heroKids, {
    opacity: 0,
    y: 14,
    filter: 'blur(6px)',
    duration: 0.75,
    ease: 'expo.out',
    stagger: 0.07,
    clearProps: 'filter'   /* снимаем blur с слоя, чтобы не держать его после анимации */
  });
}
})();
