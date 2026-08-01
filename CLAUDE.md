# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (RU default / EN toggle) one-page landing site for an independent DevOps / FinOps / Production Engineering consultant.

**As of the website-intelligence rebuild (2026-08), this is no longer a single file.** `index.html` still lives at the repo root (GitHub Pages needs it there), but markup-only now — CSS lives in `css/styles.css`, JS in `js/main.js` (i18n / modal / slider / packet animation, unchanged logic) and `js/animations.js` (GSAP ScrollTrigger reveals, new). There is still **no build step and no package.json** — every file is hand-written and served as-is; splitting into files did not add a bundler.

External dependencies, all loaded from CDN via plain `<script>`/`<link>` tags:
- Fonts from jsDelivr (`@fontsource-variable/inter`, `@fontsource/jetbrains-mono`)
- GSAP + ScrollTrigger are **vendored** in `js/vendor/` (pinned 3.13.0), not loaded from a CDN: they were the only third-party executable code on a page that has a contact field, and they came off jsDelivr by the floating `gsap@3` tag with no `integrity`. Used only for `js/animations.js`'s scroll-reveal; everything else (i18n, modal, slider, packet animation) has zero dependencies and would keep working if GSAP failed to load, since `animations.js` guards on `typeof gsap === 'undefined'` and no element ships a baked-in `opacity:0`.

## Commands

There is no build, lint or test tooling in the repo. Work is verified by driving a headless browser.

```bash
# view locally — just open the file, no server needed
open index.html

# deploy: GitHub Pages serves index.html (+ css/, js/) from main
git push origin main

# confirm the deploy actually landed (Pages lags ~30-60s; compare checksums)
# NB: checksum only the assets, never index.html — Cloudflare's Email Obfuscation
# rewrites the mailto: link and injects email-decode.min.js on the fly, so the
# live HTML never matches the file on disk. Diff it instead if you need to look.
for i in $(seq 1 20); do
  live=$(curl -s "https://devops.toys/js/main.js?x=$RANDOM" | md5)
  [ "$live" = "$(md5 -q js/main.js)" ] && echo "deployed" && break
  sleep 8
done
```

Live URL: **https://devops.toys/** (`nirdest.github.io/landing/` 301-redirects there).

Publishing is filtered by `_config.yml`. Internal working documents (`competitive-analysis.html`, `research/`, `CLAUDE.md`) are listed under `exclude:` so Jekyll does not copy them into the built site — they live in git but are **not** reachable over the web. `robots.txt` repeats those paths as `Disallow:` for defence in depth. Note this only protects the *site*: the repository is public, so every excluded file is still readable at `raw.githubusercontent.com/nirdest/landing/main/…`. If you add another internal document, add it to both, then verify it 404s after deploy rather than assuming.

`CNAME` pins the custom domain to `devops.toys`; do not delete it.

### Verifying changes

Nothing here is type-checked or unit-tested, and the CSS/SVG bugs this site has hit were all invisible in code review. **Measure in a browser instead of eyeballing screenshots.** Install Playwright in the scratchpad (not in the repo — keep it dependency-free):

```bash
cd <your scratchpad dir> && npm init -y && npm install playwright --no-save && npx playwright install chromium
```

Checks worth running after any visual change, at viewports 1440 / 1100 / 800 / 620 / 390:

- `document.documentElement.scrollWidth === clientWidth` (no horizontal overflow)
- `.h1` bounding-rect `left > 0` (see the padding footgun below)
- grid column count vs. child count (bordered grids reveal empty cells)
- pairwise `getBoundingClientRect()` intersection of all `<svg> text` nodes — **in both languages**, since EN and RU string widths differ
- `document.fonts.check('600 40px "Inter Variable"', 'Настройте')` before trusting any font change
- `pageerror` / `console.error` / `requestfailed` listeners attached throughout

## Architecture

Markup in `index.html`, styles in `css/styles.css`, behavior in `js/main.js` + `js/animations.js` — all sectioned by banner comments (`/* ============ tokens ============ */`, `<!-- ============ hero ============ -->`, twelve `=` on each side). Grep those to navigate; the banner names are consistent across all three files.

Page order: header → hero → services → before/after comparison → **what I won't do** → process → experience → **alternatives comparison** → FAQ → final CTA → footer → lead modal. The two bold sections were added in the 2026-08 rebuild; see `research/03-build-brief.md` for why. Services leads the page at the owner's request (it used to sit third, behind the comparison).

Single-page is a **deliberate** choice, re-confirmed by competitor research in `research/02-competitor-analysis.md`: the top-scoring competitors win search visibility through 45+-page programmatic architecture that doesn't fit a solo consultant's actual sales motion. Don't split this into multiple pages without re-reading that file first.

### i18n

Client-side only; no localized routes. RU is the default, EN is a toggle persisted to `localStorage` under `devopstoys-lang`.

`applyLang()` walks four attribute types and rewrites them from the `I18N` dictionary:

| attribute | applied to |
|---|---|
| `data-i18n` | `textContent` |
| `data-i18n-html` | `innerHTML` (hero H1 only — it carries an `<em>` accent) |
| `data-i18n-ph` | `placeholder` |
| `data-i18n-aria` | `aria-label` |

Static markup ships the **Russian** strings so there is no flash of the wrong language before JS runs — and since the 2026-08 audit those strings are also the single source of truth. At startup `main.js` walks the same four attributes and captures the markup text into `BASE`; `t()` resolves `I18N.en[k] → BASE[k] → I18N.ru[k] → k`. This deleted ~96 lines of duplicated dictionary and structurally removed the stale-cache bug described in the footguns.

Section eyebrows are numbered (`01 — …` through `07 — …`) and the numbers are baked into the translated strings, not generated — inserting or removing a section means renumbering every `*.eyebrow` key by hand in both `ru` and `en`.

**Invariant:** every key referenced in markup must exist in `I18N.en`. `I18N.ru` holds only the five strings that are *not* in the markup (`meta.title`, `meta.desc`, `form.sending`, `form.err`, `form.valErr`) — the rest of the Russian baseline is read off the markup itself into `BASE` at startup, so it cannot drift out of sync with the page. A key missing from `I18N.en` falls back to the Russian text, never to a raw key string. Verify after editing content:

```bash
grep -oE 'data-i18n(-ph|-aria|-html)?="[^"]+"' index.html | sed -E 's/.*="(.*)"/\1/' | sort -u
```
…then check each key exists in `I18N.en`. The Russian side needs no check — it *is* the markup.

### Before/after comparison widget

The centrepiece. Two full inline SVGs sharing `viewBox="0 0 1400 470"`, stacked absolutely:

- `.cmp-base` (`z-index:1`) holds the healthy architecture, **always fully painted** (the `id="topoAfter"` on that `<svg>` is unreferenced — CSS targets the classes)
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

A single `requestAnimationFrame` loop drives all pools, and it only runs while the widget is on screen: an `IntersectionObserver` on `.cmp` and a `visibilitychange` listener stop the loop (`running = false`) and restart it via `startFrames()`. Under `prefers-reduced-motion: reduce` nothing is seeded and the loop never starts at all.

`getPointAtLength()` is **not** called per frame — that cost ~0.07 ms per packet and burned ~3.9 ms of every 16.6 ms frame. Each path is sampled once into a lookup table (`lut()`, ~1px steps, cached by path element) and the frame just indexes it. Measured over 4 s with the widget on screen: **497 ms → 5 ms** of script time; off screen **605 ms → 3 ms**. If you change a route's `d`, the LUT is keyed by element and rebuilt only on reload — a live path edit needs `lutCache.clear()`.

Guard rails worth keeping: `p.len` falls back to `1` (a not-yet-laid-out SVG returns 0, and `0/0` makes `p.t` NaN), and the kill test is `!(p.t < 1)` rather than `p.t >= 1` so a NaN packet is retired instead of living forever.

Both SVGs paint an opaque `<rect fill="var(--card)">` to stop the layers bleeding through, which also covers `.cmp`'s CSS dot grid — so the grid is re-drawn *inside* each SVG as an `<pattern>` (`#dotsA` / `#dotsB`). Pattern ids must stay unique across the two inline SVGs; they share one document.

### Lead modal

Focus trap, Escape to close, `inert` on `#page`, focus returned to opener, honeypot field. `sendLead()` POSTs to `/api/lead`.

### Backend (`worker/`)

`worker/lead.js` is a Cloudflare Worker on route `devops.toys/api/lead`, deployed separately from the site (`npx wrangler deploy` from `worker/`, credentials below). It validates the contact string, drops honeypot hits silently, and mails the lead via the `send_email` binding from `lead@devops.toys` to the owner's verified Email Routing destination (`env.LEAD_TO`, stored as a Worker secret — not in this repo, which is public) — free on the Workers Free plan, since sending to your *own verified destination* costs nothing and doesn't touch the paid quota. Sending to an arbitrary address would need Workers Paid.

The route lives on the same zone as the site, so the browser call is same-origin and there is no CORS handling. Cloudflare proxies `devops.toys` in front of GitHub Pages; `/api/lead` is intercepted at the edge, everything else falls through to Pages.

- `worker/` is in both `_config.yml` `exclude:` and `robots.txt`, like the other non-published paths.
- **Route propagation takes 1–2 minutes after `wrangler deploy`.** Before it lands, requests reach GitHub Pages instead and POST returns Fastly's `405 Not Allowed` (`via: 1.1 varnish` in the response headers) — that is not a Worker bug, just wait and re-curl.
- The account holding `devops.toys` may not be the one `CLOUDFLARE_API_TOKEN` points at. See "Cloudflare credentials" below.
- `env.EMAIL.send()` uses the stable `cloudflare:email` `EmailMessage` API with a hand-built MIME string (base64 body + RFC 2047 subject, so Cyrillic survives). Cloudflare's newer Email Service offers a one-line `env.EMAIL.send({to, from, subject, text})` object form, in public beta since 2026-04; if the legacy call ever breaks, that swap deletes the MIME helper.

Check after any change to it:

```bash
curl -s -X POST https://devops.toys/api/lead -H 'content-type: application/json' \
  -d '{"contact":"test@example.com","language":"ru"}'          # → {"ok":true} + mail
curl -s -X POST https://devops.toys/api/lead -H 'content-type: application/json' \
  -d '{"contact":"ab"}'                                        # → 400 bad contact
curl -s -X POST https://devops.toys/api/lead -H 'content-type: application/json' \
  -d '{"contact":"x@y.zz","company":"spam"}'                   # → 200, no mail (honeypot)
```

### Cloudflare credentials

`CLOUDFLARE_API_TOKEN` may be exported in the shell environment pointing at a **different Cloudflare account** — one that cannot see `devops.toys` at all, so deploying with it would push the Worker to the wrong place. Wrangler has OAuth credentials for the right account, but that environment variable wins over them, so blank it explicitly:

```bash
cd worker && CLOUDFLARE_API_TOKEN= npx wrangler deploy
```

Confirm the target first — `CLOUDFLARE_API_TOKEN= npx wrangler whoami` lists the accounts the OAuth login can reach; the correct one is the personal account that owns the `devops.toys` zone. Pass its id via `CLOUDFLARE_ACCOUNT_ID` if wrangler asks which to use. Account ids are deliberately not written down here — this file is in a public repository.

A bare `Authentication error [code: 10000]` on upload means the credential lacks `Workers Scripts: Edit` (read-only tokens still list scripts fine, which makes this look like an account mix-up when it isn't).

### Scroll animations (`js/animations.js`)

GSAP ScrollTrigger fades/translates each `.sec` up on scroll-in (`once: true`, so it doesn't replay), plus a one-time staggered reveal of the hero's text elements on load (the selector matches descendants, not direct children). This is **pure progressive enhancement by construction**: no element carries a baked-in `opacity:0` in CSS, and the script bails out immediately (`return`) if `gsap`/`ScrollTrigger` are undefined or the visitor has `prefers-reduced-motion: reduce` — so a missing script or reduced-motion preference both leave every section simply visible, never stuck invisible. Keep that invariant if you touch this file: don't move the initial-state opacity into CSS, or a blocked CDN script turns into a blank page.

## Footguns hit in this codebase

These are real bugs that shipped here. Re-check them when touching related code.

- **Fonts without Cyrillic.** Space Grotesk has no `U+04xx` range at all, so Russian text silently fell back to a per-OS system font while Latin rendered in Space Grotesk — a mixed-font page. Before adding any font: `curl -s <fontsource css> | grep -c 'U+04'`.
- **`padding` shorthand on an element that also has `.wrap`.** `.wrap` supplies horizontal padding; a later same-specificity rule using the `padding` shorthand zeroes it, and content sits flush at `x=0` on every viewport ≤1200px. `.sec` / `.hero` / `.final` therefore use `padding-block`.
- **`grid-template-columns: repeat(auto-fit, …)` on a bordered grid.** `.cards` uses `gap:1px` over a `--line` background to draw hairlines, so any unfilled cell renders as a stray coloured box. Column counts are pinned per breakpoint instead. Six cards must always fill whole rows.
- **`parseInt(el.value, 10) || fallback`.** A valid slider value of `0` is falsy and gets replaced by the fallback. Use an `isNaN` check.
- **`[hidden]` losing to an author `display` rule.** `.overlay{display:flex}` beat the UA `[hidden]{display:none}` at equal specificity, leaving an invisible full-page layer that swallowed every click and drag on the site. `.ovl[hidden]{display:none}` is the guard.
- **SVG text has no layout engine.** Labels are hand-placed and will silently overlap when strings change length — especially when switching RU↔EN. Check intersections programmatically, in both languages.
- **Markup and dictionary shipping out of step.** `index.html` and `js/main.js` are separate files with separate 600s caches, so adding i18n keys to both at once still leaves a window where a visitor holds new markup and the old dictionary — and the page renders raw `exp.s6k` strings. Two guards now exist and both must stay: local `css/js` are linked with `?v=<date>` (**bump it whenever you change those files**), and `applyLang` skips keys the dictionary lacks, leaving the Russian text baked into the markup. Verifying over `file://` cannot see this class of bug — load the deployed URL, or stub an older `main.js` with Playwright's `page.route`.

Breakpoints are `980 / 900 / 760 / 620` and are **not** written in descending order; they currently touch disjoint properties, so verify cascade order if you add rules that overlap.

## Unfinished / needs the owner's input

- **`http://devops.toys/` still answers 200 instead of redirecting, and there is no HSTS.** A visitor who types the bare domain submits their contact over plaintext, because `fetch('/api/lead')` follows the page scheme. Fix is two toggles the owner has to flip: Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS**, then **Enable HSTS**. (HTTPS itself works — the zone is proxied by Cloudflare and TLS terminates there. DNS no longer points at GitHub's apex A records.)
- **`/api/lead` has no rate limit.** The Worker checks `Origin`, body size and contact length, but nothing stops a scripted loop from burning the 100k/day Workers quota and flooding the inbox. One WAF rate-limiting rule (5 requests / 10 min per IP on that path) is free and closes it; Turnstile only if spam actually starts.
- Consultant is **Денис Кузьмин** — `linkedin.com/in/nirdest`, `github.com/nirdest`. Both are wired into the JSON-LD `Person` (`sameAs`) and the footer. No placeholders remain in any published file.
- The name appears **only** in structured data and the footer links; nothing on the visible page names the consultant. For a site whose whole pitch is personal trust ("я свяжусь с вами лично"), a visible byline in the Experience section is an obvious gap — not done because it's a content decision the owner hasn't asked for.
- The lead form now mails leads to the owner's inbox (see "Backend"). It has **no spam protection beyond the honeypot and a length check** — no Turnstile, no rate limit. Workers Free allows 100k requests/day, so a bot could burn that; add Turnstile if spam actually shows up. Leads are not stored anywhere, the mailbox is the only archive.
- The tech stack and the "10+ years in IT / 6+ in DevOps" figures in the Experience section (and the matching pair in the hero) come from the owner's own CV, supplied 2026-08-01. The nine stack rows are his CV's skill categories; the year counts are what he asked for, and are *higher* than the CV's own "8+ / 5+" — he set them deliberately, so don't "correct" them back.
- Don't invent metrics, case studies or client names — an earlier interactive "tuner" showing fabricated latency/cost numbers was removed for exactly this reason.
- The **"what I won't do"** (`#avoid`) and **alternatives comparison** (`#alt`) sections were drafted by Claude from `research/03-build-brief.md`, following the existing site's tone and already-stated positioning (free diagnosis, pay-for-result, no lock-in) — not fabricated metrics, but still the owner should read them once before this goes live, since they're first-person claims about how the consultant actually works.
- Full competitive research behind this rebuild: `research/01-client-brand.md`, `research/02-competitor-analysis.md`, `research/03-build-brief.md`, `research/04-quality-audit.md`, and `competitive-analysis.html` in the repo root. **These are internal.** `competitive-analysis.html` scores ten named competitors; it and `research/` were briefly served publicly on the live domain before `_config.yml` excluded them. Keep them excluded.
