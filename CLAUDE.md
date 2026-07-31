# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (RU default / EN toggle) one-page landing site for an independent DevOps / FinOps / Production Engineering consultant. The whole site is **one file: `index.html`** — markup, CSS and JS inline, no build step, no dependencies, no package.json. The only tracked file is `index.html`.

Fonts are the sole external dependency, loaded from jsDelivr (`@fontsource-variable/inter`, `@fontsource/jetbrains-mono`).

## Commands

There is no build, lint or test tooling in the repo. Work is verified by driving a headless browser.

```bash
# view locally — just open the file, no server needed
open index.html

# deploy: GitHub Pages serves index.html from main
git push origin main

# confirm the deploy actually landed (Pages lags ~30-60s; compare checksums)
for i in $(seq 1 20); do
  live=$(curl -s https://nirdest.github.io/landing/ | md5)
  local=$(md5 -q index.html)
  [ "$live" = "$local" ] && echo "deployed" && break
  sleep 8
done
```

Live URL: https://nirdest.github.io/landing/

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

Everything lives in `index.html`, sectioned by banner comments (`/* ===== tokens ===== */`, `<!-- ===== hero ===== -->`, etc.). Grep those to navigate.

Page order: header → hero → before/after comparison → services → process → experience → FAQ → final CTA → footer → lead modal.

### i18n

Client-side only; no localized routes. RU is the default, EN is a toggle persisted to `localStorage` under `vibeops-lang`.

`applyLang()` walks four attribute types and rewrites them from the `I18N` dictionary:

| attribute | applied to |
|---|---|
| `data-i18n` | `textContent` |
| `data-i18n-html` | `innerHTML` (hero H1 only — it carries an `<em>` accent) |
| `data-i18n-ph` | `placeholder` |
| `data-i18n-aria` | `aria-label` |

Static markup ships the **Russian** strings so there is no flash of the wrong language before JS runs.

**Invariant:** every key referenced in markup must exist in both `I18N.ru` and `I18N.en`, and the two dictionaries must stay the same size. A missing key silently renders the raw key string. Verify after editing content:

```bash
grep -oE 'data-i18n(-ph|-aria|-html)?="[^"]+"' index.html | sed -E 's/.*="(.*)"/\1/' | sort -u
```
…then check each against both dictionaries and diff `Object.keys(I18N.ru)` against `Object.keys(I18N.en)`.

### Before/after comparison widget

The centrepiece. Two full inline SVGs sharing `viewBox="0 0 1200 470"`, stacked absolutely:

- `.cmp-base` (`z-index:1`) holds `#topoAfter` — the healthy architecture, **always fully painted**
- `.cmp-top` (`z-index:2`, `#cmpTop`) holds `#topoBefore` — the degraded one, revealed from the left by `clip-path: inset(0 N% 0 0)`
- a native `<input type=range>` (`#cmpSlider`) overlays the box and drives both the clip-path and the divider's `left`

Because both layers are stacked, **each SVG needs its own opaque `<rect fill="var(--card)">` as the first child** or the two diagrams show through each other at every slider position.

The "before" SVG carries `class="tone-bad"`, which restyles the shared `.shape` / `.det` / `.route` / `.led` / `.pkt-*` primitives to the red degraded palette. Both SVGs reuse the same primitive classes — style the class, not the element.

Keep the two monitoring blocks horizontally apart (ghost at x≈300, live at x≈780). When they sat at the same x they overlapped into unreadable garbage at the 50% split.

Below 760px the widget changes mode: `.cmp-wrap` scrolls horizontally with `min-width:860px` on `.cmp` (labels are unreadable at phone scale otherwise) and `.cmp-range` switches to `position:static`, becoming a normal visible slider below the diagram. This is why the input sits **outside** `.cmp` in the DOM — it must not scroll away with the diagram.

### Packet animation

`makePool(host, paths, speed, gap, cap)` returns `{step, hide}`. Dots are pooled and recycled, positioned each frame with `path.getPointAtLength()` along real `<path>` elements referenced by id (`#pBefore`, `#pA1`…`#pA4`) — the visible routes *are* the animation paths, so changing a route's `d` moves the packets with it.

A single `requestAnimationFrame` loop drives all pools. Motion is suppressed when `prefers-reduced-motion: reduce` or the tab is hidden.

### Lead modal

Focus trap, Escape to close, `inert` on `#page`, focus returned to opener, honeypot field. `sendLead()` is **simulated** — it resolves after a timeout. There is no backend; wiring `POST /api/lead` is unfinished work.

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

- Placeholders still in the file: `[YOUR_DOMAIN]` (×4), `[YOUR_HANDLE]` (×3), `[YOUR_NAME]` (×2) — footer links, canonical, OG, JSON-LD.
- The lead form does not submit anywhere.
- The tech stack listed in the Experience section was partly inferred and has not been confirmed by the owner. Don't present it as verified.
- Don't invent metrics, case studies or client names — an earlier interactive "tuner" showing fabricated latency/cost numbers was removed for exactly this reason.
