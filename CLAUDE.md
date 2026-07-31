# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (RU default / EN toggle) one-page landing site for an independent DevOps / FinOps / Production Engineering consultant.

**As of the website-intelligence rebuild (2026-08), this is no longer a single file.** `index.html` still lives at the repo root (GitHub Pages needs it there), but markup-only now — CSS lives in `css/styles.css`, JS in `js/main.js` (i18n / modal / slider / packet animation, unchanged logic) and `js/animations.js` (GSAP ScrollTrigger reveals, new). There is still **no build step and no package.json** — every file is hand-written and served as-is; splitting into files did not add a bundler.

External dependencies, all loaded from CDN via plain `<script>`/`<link>` tags:
- Fonts from jsDelivr (`@fontsource-variable/inter`, `@fontsource/jetbrains-mono`)
- GSAP + ScrollTrigger from jsDelivr (`gsap@3/dist/gsap.min.js`, `gsap@3/dist/ScrollTrigger.min.js`) — used only for `js/animations.js`'s scroll-reveal; everything else (i18n, modal, slider, packet animation) has zero dependencies and would keep working if GSAP failed to load, since `animations.js` guards on `typeof gsap === 'undefined'` and no element ships a baked-in `opacity:0`.

## Commands

There is no build, lint or test tooling in the repo. Work is verified by driving a headless browser.

```bash
# view locally — just open the file, no server needed
open index.html

# deploy: GitHub Pages serves index.html (+ css/, js/) from main
git push origin main

# confirm the deploy actually landed (Pages lags ~30-60s; compare checksums)
for i in $(seq 1 20); do
  live=$(curl -s http://devops.toys/ | md5)
  local=$(md5 -q index.html)
  [ "$live" = "$local" ] && echo "deployed" && break
  sleep 8
done
```

Live URL: **https://devops.toys/** (`nirdest.github.io/landing/` 301-redirects there).

Publishing is filtered by `_config.yml`. Internal working documents (`competitive-analysis.html`, `research/`, `CLAUDE.md`) are listed under `exclude:` so Jekyll does not copy them into the built site — they live in git but are **not** reachable over the web. `robots.txt` repeats the same two paths as `Disallow:` for defence in depth. If you add another internal document, add it to both, then verify it 404s after deploy rather than assuming.

`CNAME` pins the custom domain to `devops.toys`; do not delete it.

### Verifying changes

Nothing here is type-checked or unit-tested, and the CSS/SVG bugs this site has hit were all invisible in code review. **Measure in a browser instead of eyeballing screenshots.** Install Playwright in the scratchpad (not in the repo — keep it dependency-free):

```bash
cd "$SCRATCHPAD" && npm init -y && npm install playwright --no-save && npx playwright install chromium
```

Checks worth running after any visual change, at viewports 1440 / 1100 / 800 / 620 / 390:

- `document.documentElement.scrollWidth === clientWidth` (no horizontal overflow)
- `.h1` bounding-rect `left > 0` (see the padding footgun below)
- grid column count vs. child count (bordered grids reveal empty cells)
- pairwise `getBoundingClientRect()` intersection of all `<svg> text` nodes — **in both languages**, since EN and RU string widths differ
- `document.fonts.check('600 40px "Inter Variable"', 'Настройте')` before trusting any font change
- `pageerror` / `console.error` / `requestfailed` listeners attached throughout

## Architecture

Markup in `index.html`, styles in `css/styles.css`, behavior in `js/main.js` + `js/animations.js` — all sectioned by banner comments (`/* ===== tokens ===== */`, `<!-- ===== hero ===== -->`, etc.). Grep those to navigate; the banner names are consistent across all three files.

Page order: header → hero (with a reserved, empty 3D-asset zone, see below) → before/after comparison → **what I won't do** → services → process → experience → **alternatives comparison** → FAQ → final CTA → footer → lead modal. The two bold sections were added in the 2026-08 rebuild; see `research/03-build-brief.md` for why.

Single-page is a **deliberate** choice, re-confirmed by competitor research in `research/02-competitor-analysis.md`: the top-scoring competitors win search visibility through 45+-page programmatic architecture that doesn't fit a solo consultant's actual sales motion. Don't split this into multiple pages without re-reading that file first.

### Hero 3D placeholder

`.hero-3d` in `index.html` is an empty, reserved 640×640 zone, absolutely positioned to the right of the hero text, hidden below 1150px (`css/styles.css`). Nothing renders there today — it's a slot for a future scroll-driven asset (see the HTML comment right above it for the exact contract). If you fill it, wire its scroll progress through `js/animations.js`, not a new file.

### i18n

Client-side only; no localized routes. RU is the default, EN is a toggle persisted to `localStorage` under `devopstoys-lang`.

`applyLang()` walks four attribute types and rewrites them from the `I18N` dictionary:

| attribute | applied to |
|---|---|
| `data-i18n` | `textContent` |
| `data-i18n-html` | `innerHTML` (hero H1 only — it carries an `<em>` accent) |
| `data-i18n-ph` | `placeholder` |
| `data-i18n-aria` | `aria-label` |

Static markup ships the **Russian** strings so there is no flash of the wrong language before JS runs. `I18N` itself now lives in `js/main.js`, not inline in `index.html`.

Section eyebrows are numbered (`01 — …` through `07 — …`) and the numbers are baked into the translated strings, not generated — inserting or removing a section means renumbering every `*.eyebrow` key by hand in both `ru` and `en`.

**Invariant:** every key referenced in markup must exist in both `I18N.ru` and `I18N.en`, and the two dictionaries must stay the same size (170 keys each as of the 2026-08 rebuild). A missing key silently renders the raw key string. Verify after editing content:

```bash
grep -oE 'data-i18n(-ph|-aria|-html)?="[^"]+"' index.html | sed -E 's/.*="(.*)"/\1/' | sort -u
```
…then check each against both dictionaries and diff `Object.keys(I18N.ru)` against `Object.keys(I18N.en)`.

### Before/after comparison widget

The centrepiece. Two full inline SVGs sharing `viewBox="0 0 1400 470"`, stacked absolutely:

- `.cmp-base` (`z-index:1`) holds `#topoAfter` — the healthy architecture, **always fully painted**
- `.cmp-top` (`z-index:2`, `#cmpTop`) holds `#topoBefore` — the degraded one, revealed from the left by `clip-path: inset(0 N% 0 0)`
- a native `<input type=range>` (`#cmpSlider`) overlays the box and drives both the clip-path and the divider's `left`

Because both layers are stacked, **each SVG needs its own opaque `<rect fill="var(--card)">` as the first child** or the two diagrams show through each other at every slider position.

The "before" SVG carries `class="tone-bad"`, which restyles the shared `.shape` / `.det` / `.route` / `.led` / `.pkt-*` primitives to the red degraded palette. Both SVGs reuse the same primitive classes — style the class, not the element.

Each layer also carries its own HTML `.cmp-chrome` header (caption + system status), so the clip reveals the state that matches the side you are looking at — red "система деградировала" on the before half, green "система в норме" on the after half. The `.cmp-legend` is shared and therefore sits **outside** the clipped area.

Anything positioned near the horizontal centre gets sliced in half at the default 50% divider. The "after" monitoring block (x≈900) and the tag row are deliberately placed clear of it. Before moving anything into the middle, check it doesn't straddle the divider.

Below 760px the widget changes mode: `.cmp-wrap` scrolls horizontally with `min-width:1040px` on `.cmp` (labels are unreadable at phone scale otherwise) and `.cmp-range` switches to `position:static`, becoming a normal visible slider below the diagram. This is why the input sits **outside** `.cmp` in the DOM — it must not scroll away with the diagram.

### Packet animation

`makePool(host, paths, speed, gap, cap)` returns `{seed, step, hide}`. Dots are pooled and recycled, positioned each frame with `path.getPointAtLength()` along real `<path>` elements referenced by id (`#pBefore`, `#pA1`…`#pA3`) — the visible routes *are* the animation paths, so changing a route's `d` moves the packets with it.

`seed()` must be called once at startup: it fills each lane with packets at random `t`. Without it the whole batch spawns at `t=0` and travels as a single visible clump, because transit time far exceeds `cap × gap`.

A single `requestAnimationFrame` loop drives all pools. Motion is suppressed when `prefers-reduced-motion: reduce` or the tab is hidden.

Both SVGs paint an opaque `<rect fill="var(--card)">` to stop the layers bleeding through, which also covers `.cmp`'s CSS dot grid — so the grid is re-drawn *inside* each SVG as an `<pattern>` (`#dotsA` / `#dotsB`). Pattern ids must stay unique across the two inline SVGs; they share one document.

### Lead modal

Focus trap, Escape to close, `inert` on `#page`, focus returned to opener, honeypot field. `sendLead()` is **simulated** — it resolves after a timeout. There is no backend; wiring `POST /api/lead` is unfinished work.

### Scroll animations (`js/animations.js`)

GSAP ScrollTrigger fades/translates each `.sec` up on scroll-in (`once: true`, so it doesn't replay), plus a one-time staggered reveal of the hero's direct children on load. This is **pure progressive enhancement by construction**: no element carries a baked-in `opacity:0` in CSS, and the script bails out immediately (`return`) if `gsap`/`ScrollTrigger` are undefined or the visitor has `prefers-reduced-motion: reduce` — so a CDN failure or reduced-motion preference both leave every section simply visible, never stuck invisible. Keep that invariant if you touch this file: don't move the initial-state opacity into CSS, or a blocked CDN script turns into a blank page.

## Footguns hit in this codebase

These are real bugs that shipped here. Re-check them when touching related code.

- **Fonts without Cyrillic.** Space Grotesk has no `U+04xx` range at all, so Russian text silently fell back to a per-OS system font while Latin rendered in Space Grotesk — a mixed-font page. Before adding any font: `curl -s <fontsource css> | grep -c 'U+04'`.
- **`padding` shorthand on an element that also has `.wrap`.** `.wrap` supplies horizontal padding; a later same-specificity rule using the `padding` shorthand zeroes it, and content sits flush at `x=0` on every viewport ≤1200px. `.sec` / `.hero` / `.final` therefore use `padding-block`.
- **`grid-template-columns: repeat(auto-fit, …)` on a bordered grid.** `.cards` uses `gap:1px` over a `--line` background to draw hairlines, so any unfilled cell renders as a stray coloured box. Column counts are pinned per breakpoint instead. Six cards must always fill whole rows.
- **`parseInt(el.value, 10) || fallback`.** A valid slider value of `0` is falsy and gets replaced by the fallback. Use an `isNaN` check.
- **`[hidden]` losing to an author `display` rule.** `.overlay{display:flex}` beat the UA `[hidden]{display:none}` at equal specificity, leaving an invisible full-page layer that swallowed every click and drag on the site. `.ovl[hidden]{display:none}` is the guard.
- **SVG text has no layout engine.** Labels are hand-placed and will silently overlap when strings change length — especially when switching RU↔EN. Check intersections programmatically, in both languages.

Breakpoints are `980 / 900 / 760 / 620` and are **not** written in descending order; they currently touch disjoint properties, so verify cascade order if you add rules that overlap.

## Unfinished / needs the owner's input

- **HTTPS is not yet working on the custom domain.** DNS resolves and the site serves over `http://devops.toys/`, but GitHub has not provisioned a TLS certificate for it — `https://devops.toys/` fails with a `*.github.io` certificate name mismatch. The `CNAME` file now exists (it did not before, which is the usual cause). Finishing this needs a UI action nobody but the repo owner can take: Settings → Pages → wait for "Certificate provisioned", then tick **Enforce HTTPS**.
- DNS currently has only **two** of GitHub's four apex A records (`185.199.108.153`, `185.199.109.153`). Adding `110.153` and `111.153` costs nothing and buys redundancy.
- Consultant is **Денис Кузьмин** — `linkedin.com/in/nirdest`, `github.com/nirdest`. Both are wired into the JSON-LD `Person` (`sameAs`) and the footer. No placeholders remain in any published file.
- The name appears **only** in structured data and the footer links; nothing on the visible page names the consultant. For a site whose whole pitch is personal trust ("я свяжусь с вами лично"), a visible byline in the Experience section is an obvious gap — not done because it's a content decision the owner hasn't asked for.
- The lead form does not submit anywhere.
- The tech stack listed in the Experience section was partly inferred and has not been confirmed by the owner. Don't present it as verified.
- Don't invent metrics, case studies or client names — an earlier interactive "tuner" showing fabricated latency/cost numbers was removed for exactly this reason.
- The `.hero-3d` zone is an empty placeholder — no asset exists yet. See "Hero 3D placeholder" above.
- The **"what I won't do"** (`#avoid`) and **alternatives comparison** (`#alt`) sections were drafted by Claude from `research/03-build-brief.md`, following the existing site's tone and already-stated positioning (free diagnosis, pay-for-result, no lock-in) — not fabricated metrics, but still the owner should read them once before this goes live, since they're first-person claims about how the consultant actually works.
- Full competitive research behind this rebuild: `research/01-client-brand.md`, `research/02-competitor-analysis.md`, `research/03-build-brief.md`, and `competitive-analysis.html` in the repo root. **These are internal.** `competitive-analysis.html` scores ten named competitors; it and `research/` were briefly served publicly on the live domain before `_config.yml` excluded them. Keep them excluded.
