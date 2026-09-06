(function(){
'use strict';
// Content remains visible without animation or third-party scripts.
if (typeof gsap === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var heroKids = document.querySelectorAll('.hero .h1, .hero .lead, .hero .cta-row, .hero .hero-trust');
if (heroKids.length) gsap.from(heroKids, {opacity: 0, y: 10, duration: 0.5, ease: 'expo.out', stagger: 0.06});
})();
