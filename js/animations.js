(function(){
'use strict';

/* Progressive enhancement only: nothing here sets an initial opacity in CSS,
   so if the GSAP CDN fails to load or the visitor has reduced motion set,
   every section is simply visible already — there is no broken/invisible
   fallback state to guard against. */
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

gsap.registerPlugin(ScrollTrigger);

var heroKids = document.querySelectorAll('.hero .eyebrow, .hero .h1, .hero .lead, .hero .ai-badge-row, .hero .cta-row, .hero .hero-trust');
if (heroKids.length) {
  gsap.from(heroKids, {
    opacity: 0, y: 16, duration: 0.6, ease: 'power2.out', stagger: 0.08
  });
}

Array.prototype.slice.call(document.querySelectorAll('.sec')).forEach(function(el){
  gsap.fromTo(el,
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    }
  );
});
})();
