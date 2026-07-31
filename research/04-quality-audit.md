# Quality Audit — VibeOps Rebuild

Phase 6 of the website-intelligence process. Run after splitting `index.html` into
`index.html` + `css/styles.css` + `js/main.js` + `js/animations.js`, and after adding
the `#avoid` and `#alt` sections, the `.hero-3d` placeholder, and GSAP ScrollTrigger
reveals. Verified with Playwright (Chromium) at 1440/1100/800/620/390px, in both RU
and EN, per the method already established in `CLAUDE.md`.

## SEO Audit
- [x] Meta tags present and unique (single page — one title, one description, both localized on language toggle via `applyLang()`)
- [x] Heading hierarchy correct — one `<h1>` (hero), `<h2>` per section, no skipped levels
- [x] Alt text / accessible names on all graphics — no raster `<img>` anywhere; both topology SVGs carry `role="img"` + `<title>`, decorative icons (`avoid-mark`, logo glyphs) are `aria-hidden="true"`
- [x] Schema markup validates — JSON-LD parsed with `JSON.parse()`, valid
- [x] XML sitemap generated — added `sitemap.xml` (root, single URL, placeholder domain)
- [x] `robots.txt` present — added (root, allows all, points to sitemap)
- [~] Open Graph tags set — `og:title`/`og:description`/`og:type`/`twitter:card` present (unchanged from before this rebuild); **no `og:image`** — not added, because fabricating an absolute image URL against the still-placeholder `[YOUR_DOMAIN]` would be worse than omitting it. Add once a real domain and an actual OG image exist.

## Accessibility Audit
- [x] Color contrast — measured all text/background pairs against WCAG AA. One failure found and fixed: `--muted` (`#71756A` on `--bg` `#F5F2EA`) measured **4.21:1**, below the 4.5:1 required for the small mono text (`.eyebrow`, `.hero-trust`, `.step-n`) that uses it. Darkened to `#66695E` → **5.01:1** on `--bg`, **5.51:1** on `--card`. All other pairs already passed (ink/ink-2/acc-deep/danger all ≥5.3:1). This is a repo-wide token change, not scoped to the new sections — it also fixes contrast on pre-existing text that used `--muted`.
- [x] All interactive elements keyboard accessible — buttons, links, the range slider, and the modal's focus trap were unchanged from the working original implementation
- [x] Focus indicators visible — `:focus-visible` outline rule unchanged, still applies globally including inside the new `#alt` table and `#avoid` list (both use plain semantic markup, no custom-focusable elements added)
- [x] `prefers-reduced-motion` respected — existing CSS blanket rule unchanged; `js/animations.js` additionally checks `matchMedia('(prefers-reduced-motion: reduce)')` itself and returns before calling GSAP at all
- [x] Semantic HTML — new sections use `<table>` with `<th>`/`<td>` (alternatives) and a plain `<div>` list with `<p>` text (avoid list); no `<div>`-soup introduced

## Performance Audit
- [x] No images to optimize/lazy-load — site is 100% inline SVG + text, unchanged
- [x] No render-blocking regression — `css/styles.css` is one small stylesheet linked in `<head>` (same network cost class as the fonts already loaded there); GSAP + ScrollTrigger + `main.js` + `animations.js` are all placed at the very end of `<body>`, after all content, so they cannot block first paint
- [x] GSAP loaded efficiently — two small CDN files, only used for opt-in scroll reveals; **verified progressive enhancement**: `animations.js` bails out via `typeof gsap === 'undefined'` guard, and no element has a CSS-level `opacity:0`, so a blocked/slow CDN leaves the page fully visible, never stuck invisible
- [x] Animations don't cause layout shift — all GSAP tweens animate `opacity`/`y` (a `transform`), never `height`/`margin`/`top`, so nothing shifts document flow
- [x] Fixed a real bug found during this audit: the hero's GSAP stagger originally targeted `hero.children`, which — after wrapping the hero's text in a `.wrap-in` div for z-index stacking above `.hero-3d` — resolved to only 2 elements (the empty 3D placeholder + one big wrapper), silently collapsing the intended multi-element stagger into a single fade. Retargeted to the actual text elements (`.eyebrow, .h1, .lead, .cta-row, .hero-trust`) so the stagger animates as designed.

## Client-Ready Checklist
- [x] All placeholder content clearly marked — `[YOUR_DOMAIN]`/`[YOUR_HANDLE]`/`[YOUR_NAME]` unchanged and still flagged in both `index.html`'s own comment header and `CLAUDE.md`
- [x] 3D asset placeholder clearly marked — `.hero-3d` + inline HTML comment with exact dimensions (640×640) and integration note
- [x] Forms have their (absent) action endpoint noted — `sendLead()` comment in `js/main.js` still states the real `/api/lead` wiring is unfinished
- [x] Favicon set — inline SVG data URI, unchanged
- [ ] OG image — intentionally not set; see SEO Audit note above
- [ ] 404 page — **not added**. GitHub Pages serves a generic 404 for a single-page site with no routes; a custom `404.html` is only worth adding once the site has a real domain and the owner wants a branded miss page. Flagging as a genuine gap, not silently skipping it.
- [x] README — **not added**. This repo already has `CLAUDE.md` serving the equivalent purpose (what this is, how to view/deploy/verify) more thoroughly than a template README would, and duplicating that content risks the two drifting out of sync. `CLAUDE.md` was updated in this rebuild to describe the new file layout, dependencies, and sections.
- [x] Project "deployed to preview" — not pushed; per this session's own git-safety rules, pushing to `main` requires separate explicit confirmation. All changes are local and verified via headless browser; ready for the user to review and push.

## Net changes this audit made
1. Darkened `--muted` token (`#71756A` → `#66695E`) — fixes a real AA-contrast failure, repo-wide.
2. Fixed the hero GSAP stagger target (was accidentally reduced to 2 elements by the new `.wrap-in` wrapper).
3. Added `robots.txt` and `sitemap.xml`.

No other issues found. Full re-run of the browser check suite (overflow, `h1` position, font-loading, SVG-label collisions, console/network errors — all at 1440/1100/800/620/390px, RU and EN) passed clean after these fixes.
