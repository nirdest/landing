# CLAUDE.md

## Current release — 2026-09-09

**2026-09-09 (second pass) — the owner reordered and rewrote `#audit`.** Process
now comes before the audit example: the process explains what step 01 produces,
and the example then shows it. The example itself was a single abstract report
entry with four form fields ("Исходная ситуация / Риск / Проверка / Приёмка");
the owner's words were "выглядит красиво, но ничего не даёт потенциальному
покупателю". It is now a **systems summary** — seven findings, each a system, a
verdict (`нужно действие` / `можно улучшить` / `в порядке`) and one line on what
to do about it, ordered worst first and closed by a tally. The systems and the
figures in it, including the ≈$3 000/month cloud saving, are **invented for the
example** and must stay labelled as such in three places: the sample label, the
disclosure paragraph and inside the row text itself ("в этом примере"). The
report closes on `.report-plan` — what to fix, the acceptance criteria, and the
owner's own figure for the example scope: **5 дней · $3 000, окупается за 28
дней** against the $3 000/month saving above it. The owner set that number on
2026-09-09; do not adjust it, and do not add a second price anywhere. The
`.plan-note` line under it ("стоимость вашей работы называю после диагностики…
не смог помочь — не платите") is what keeps the example from reading as a price
list, and it ships with the figure or not at all. This is
the same licence the deleted incident log had — an illustrative scenario, never
a claimed client result — and it is the only place on the site where numbers may
appear at all.

**2026-09-09 — motion and craft pass.** No content, copy, offer or page order
changed. GSAP was deleted (see dependencies); the hero arrival is CSS keyframes
and the page's one authored moment is now the audit report writing itself in.
Press feedback (`scale(0.975)`), the hover arrow (which was bound to a class
that no longer existed), hover gating on touch, the header hairline that only
appears once the page scrolls, and animated FAQ disclosure were added. Two real
defects were fixed: the global `:focus-visible` rule was reshaping every focused
button, and six blocks of dead CSS were left from removed sections. Details in
Motion and Footguns below.

The owner requested removal of the “What I won’t do” section on 2026-09-07. Its markup, translations and styles are removed. Do not restore it from the historical notes below.

The owner authorized a content and usability revision following a CTO review. Current page order: hero → six services with deliverables → process → explicitly illustrative audit summary (`#audit`) → named consultant → engagement formats (`#formats`) → FAQ → contact. The old incident logs (`#compare`) and competitor table (`#alt`) were removed; descriptions of them below are historical, not requirements to restore them. There are no client cases or claimed demo measurements. AI prototype work remains a service without dominating the hero.

The lead endpoint and Worker remain unchanged. The modal now guards close/focus timers and hidden error styling. Production HTTP visits redirect in the document and the form refuses plaintext transmission; this is a frontend safeguard, not an edge HTTPS redirect or HSTS. The Cloudflare edge still needs server-side HTTPS enforcement.

Keep RU/EN parity, the existing warm terminal style, free diagnosis, payment for agreed results, and the existing GitHub Pages deployment. Never invent prices, availability, client identities or test results.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (RU default / EN toggle) one-page landing site for an independent DevOps / FinOps / Production Engineering consultant.

**As of the website-intelligence rebuild (2026-08), this is no longer a single file.** `index.html` still lives at the repo root (GitHub Pages needs it there), but markup-only now — CSS lives in `css/styles.css`, JS in `js/main.js` (i18n, lead modal) and `js/animations.js` (the audit-report reveal). There is still **no build step and no package.json** — every file is hand-written and served as-is; splitting into files did not add a bundler.

External dependencies, all loaded from CDN via plain `<script>`/`<link>` tags:
- Fonts from jsDelivr (`@fontsource-variable/inter`, `@fontsource-variable/source-serif-4`, `@fontsource/jetbrains-mono`)
- **No JavaScript dependencies at all.** GSAP used to be vendored in `js/vendor/gsap.min.js` for one thing — the hero's staggered arrival. It was removed on 2026-09-09: 70 KB of third-party executable code on a page with a contact field, for four elements that CSS keyframes animate better (CSS animation runs off the main thread, which on first paint is exactly the thread that is busy). Don't reintroduce an animation library; if something genuinely needs sequencing, WAAPI is already in the browser.

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
- every check run **in both languages** — EN and RU string widths differ, and that difference is what has broken layout here before
- `document.fonts.check('600 40px "Source Serif 4 Variable"', 'Настройте')` before trusting any font change
- no raw i18n keys rendered: scan `body.innerText` for `/\b(svc|cmp|exp|log|…)\.[a-z0-9]+\b/i`
- `pageerror` / `console.error` / `requestfailed` listeners attached throughout

## Architecture

Markup in `index.html`, styles in `css/styles.css`, behavior in `js/main.js` + `js/animations.js` — all sectioned by banner comments (`/* ============ tokens ============ */`, `<!-- ============ hero ============ -->`, twelve `=` on each side). Grep those to navigate; the banner names are consistent across all three files.

Two `.cta-inline` rows sit in the flow — after `.changes` in `#compare` and
after `.steps` in `#process`. They exist because those are the page's two peaks
of intent (the log scene, and the process ending on "не платите ничего") and
there used to be **6247px between the hero and the footer without a single
button**. They are deliberately a row and not a card: a boxed CTA would compete
with `.final`, and the two have different jobs — these catch someone already
convinced, `.final` closes the page. Keep them quiet.

`.card-lead` puts "Продакшен для AI-прототипов" first in `.cards` with an accent
border. Of ten competitors studied in `research/02`, one targets this and their
page is `noindex`; the card used to be sixth of six and visually identical to
the rest, so the layout ranked the only uncontested segment last. The border
says "this case is special", not "this is all I do" — don't escalate it to a
filled card or a badge.

`.hero-trust` opens with `0 ₽ за диагностику`, then the year counts, then the
tech list. Risk removal leads (PRODUCT.md principle 1); the stack confirms
rather than opens. The `0 ₽` markup is duplicated from `#experience` — same
`exp.n3v` / `exp.n3` keys, and `applyLang` walks all matching nodes, so both
stay in sync automatically.

Page order: header → hero → services → before/after comparison → **what I won't do** → process → experience → **alternatives comparison** → FAQ → final CTA → footer → lead modal. The two bold sections were added in the 2026-08 rebuild; see `research/03-build-brief.md` for why. Services leads the page at the owner's request (it used to sit third, behind the comparison).

Single-page is a **deliberate** choice, re-confirmed by competitor research in `research/02-competitor-analysis.md`: the top-scoring competitors win search visibility through 45+-page programmatic architecture that doesn't fit a solo consultant's actual sales motion. Don't split this into multiple pages without re-reading that file first.

### i18n

Client-side only; no localized routes. RU is the default, EN is a toggle persisted to `localStorage` under `devopstoys-lang`.

`applyLang()` walks four attribute types and rewrites them from the `I18N` dictionary:

| attribute | applied to |
|---|---|
| `data-i18n` | `textContent` |
| `data-i18n-html` | `innerHTML` (hero H1, which carries an `<em>` accent, and the "0 ₽" stat, whose currency glyph is a nested `<span>` and must vanish in EN) |
| `data-i18n-ph` | `placeholder` |
| `data-i18n-aria` | `aria-label` |

Static markup ships the **Russian** strings so there is no flash of the wrong language before JS runs — and since the 2026-08 audit those strings are also the single source of truth. At startup `main.js` walks the same four attributes and captures the markup text into `BASE`; `t()` resolves `I18N.en[k] → BASE[k] → I18N.ru[k] → k`. This deleted ~96 lines of duplicated dictionary and structurally removed the stale-cache bug described in the footguns.

Sections have **no eyebrow or kicker** above the heading, and the services cards carry no `01`–`06` numbers. Both were removed in the 2026-08-25 polish pass: a small label above a heading is decoration that dilutes the heading, and the service numbers implied a sequence that does not exist. The process steps keep `01`–`04` because there the order is the content. Don't reintroduce either.

**Invariant:** every key referenced in markup must exist in `I18N.en`. `I18N.ru` holds only the five strings that are *not* in the markup (`meta.title`, `meta.desc`, `form.sending`, `form.err`, `form.valErr`) — the rest of the Russian baseline is read off the markup itself into `BASE` at startup, so it cannot drift out of sync with the page. A key missing from `I18N.en` falls back to the Russian text, never to a raw key string. Verify after editing content:

```bash
grep -oE 'data-i18n(-ph|-aria|-html)?="[^"]+"' index.html | sed -E 's/.*="(.*)"/\1/' | sort -u
```
…then check each key exists in `I18N.en`. The Russian side needs no check — it *is* the markup.

### Before/after comparison (`#compare`)

Two terminal windows side by side, showing the log of one night: the database
fails at 02:14 and the two columns diverge from there. The scenario is
**illustrative** — it is not a result claimed for a real client, and the numbers
inside it (7 s, 23 days, 7 h 48 min) are part of the story, not statistics.

Plain markup: `.logs` is a `1fr 1fr` grid of `.term` windows, each row a
`.log-row` with `.log-ts` / `.log-src` / `.log-msg`. Row tone comes from
`.log-bad` / `.log-ok` / `.log-warn` on the row, never from inline colour.
Below 900px the grid collapses to one column and the windows stack — there is
no horizontal scrolling anywhere on the page.

There is **no slider**, deliberately: a vertical wipe cuts log lines through
the middle of a word, and on a phone the result is unreadable. This replaced
two inline SVG topologies, a `clip-path` wipe, an `<input type=range>` and the
pooled packet animation — about 470 lines, removed in the 2026-08-24 redesign.
Four footguns went with them (SVG text overlap across RU↔EN, `parseInt || fallback`
on the slider, pattern-id collisions between two inline SVGs, and the 1040px
horizontal-scroll mode below 760px). Don't reintroduce a diagram here without
re-reading why it left.

`.logs .term-body` is where the monospace font is declared — **not** `.term-body`,
which the hero shares. Putting it on the shared class drags the whole hero
headline into monospace.

### Lead modal

Focus trap, Escape to close, `inert` on `#page`, focus returned to opener, honeypot field. `sendLead()` POSTs to `/api/lead`.

The copy carries the offer, not a restatement of the heading: `form.desc` repeats
the three risk-reversal facts (free, 1–3 days, read-only is usually enough, no
payment if I can't help) because this is the moment a stranger is asked for a
contact so someone can look at their production, and every one of those facts
lived elsewhere on the page. `.m-priv` sits **above** the button — a promise
about what happens to the contact has to be readable before the press, not
after. The submit button names the outcome (`Получить бесплатный аудит` /
`Get the free audit`), and so do the two buttons that open the modal, so the
whole flow makes one promise instead of asking for a favour.

`looksLikeContact()` is the validation, and it exists **twice on purpose** — in
`js/main.js` and in `worker/lead.js`. There is no shared module between them
(the site and the Worker deploy separately, and the repo has no build step), and
a browser-only check is worth nothing here because `/api/lead` is POSTed
directly. Change one, change both. Before it existed, both sides checked only
length, so `аааааа` arrived as a lead nobody could answer.

The rules are deliberately loose: they look for an email, an `@handle`, a link
or a phone **anywhere in the string**, so «мой телеграм @nirdest» passes.
Letting a little junk through costs one ignored email; rejecting a real contact
costs the lead the whole page exists to capture.

`showErr(key, opts)` separates `opts.field` from `opts.mail`, and that split
matters: a network failure must **not** set `aria-invalid` or the red border,
because the contact in the field is fine — the network is what broke. Marking
the field there would tell a screen-reader user they typed something wrong when
they did not. `clearErr()` runs on `input`, so the field stops being marked
wrong the moment the visitor starts fixing it.

`#fErr` holds two children and `showErr(key, withMail)` drives them: a
`<span id="fErrMsg">` for the message and a permanent `<a id="fErrMail">` that
unhides only on a network failure. Keep that split. A validation error is fixed
in the field, so the address would be noise; a network failure is not, and
without a reachable address the user is trapped — the modal has `inert` on
`#page`, so the footer's `hello@devops.toys` cannot be clicked. The address is
a separate element rather than markup inside the string so the message stays one
complete translatable sentence and nothing needs `innerHTML`.

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

### Icons

Every icon is drawn inline SVG on the shared `.ico` class: one stroke width
(1.6), round caps and joins, `currentColor`, sized in `em` so it tracks the
text it sits beside. The page previously mixed Unicode arrows, a `✓`, a `✕`
and a `⚡` emoji — each arriving from a different font with its own weight and
metrics, which is not an icon system. If you add an icon, draw it on the same
grid rather than reaching for a glyph.

### Motion (`js/animations.js`)

**The focal sequence is the audit report, and it is the only authored moment on
the page.** When `#audit` comes into frame, `.report-body` fills itself in from
the top — label, headline, disclosure, the seven `.fnd` findings, then the
tally — each 380 ms, 55 ms apart, with a drawn block caret blinking on the sample label
while it runs. The section is the page's proof instead of client cases, and it
should read as a document being written, not as one more block with a fade.
Nothing else on the page reveals on scroll.

Guard rails that must survive any edit here:

- `.is-writing` is the only thing that hides report rows, and **only the script
  adds it**. No `opacity: 0` for this content lives in CSS outside
  `.is-writing`/`.is-playing`. A failed script, JS switched off, a missing
  `IntersectionObserver` or `prefers-reduced-motion: reduce` all leave the
  report fully visible — never an empty terminal window.
- The routine is wrapped in `try/catch`, and a 6 s fallback timer reveals
  everything if the observer never fires. Decoration may fail; the report may
  not.
- `is-writing` is removed at the same moment `is-playing` is added. While it is
  still on, the row's base `opacity` is 0, so the keyframe interpolates 0 → 0
  and nothing moves — the rows just pop when the classes come off.
- The observer uses `threshold: 0` with a bottom `rootMargin`, not an area
  threshold: the window is taller than the viewport, so "15 % visible" is
  reached only after an empty frame has stood on screen for several hundred
  milliseconds.
- If the report is already inside the viewport at load, the script returns
  without hiding anything. Hiding what the visitor is already looking at is a
  flash, not an entrance.
- The caret is a drawn `::after` block, not a Unicode glyph, and it exists only
  while `.is-playing` is on the report — it cannot blink off screen.

Supporting motion is feedback only, never decoration: the modal panel arrives
(320 ms in, 170 ms out — the exit is always faster), the success tick draws
itself with `stroke-dashoffset` to acknowledge the page's single conversion
action, an opened FAQ answer fades in and (where `::details-content` and
`interpolate-size` exist) grows to height rather than snapping, and every
pressable control takes `scale(0.975)` on `:active`. Each has a
`prefers-reduced-motion` path that removes movement while keeping the state
change legible; the tick, for instance, is simply drawn already.

Hover-only affordances (the CTA lift, the arrow slide) live inside
`@media (hover: hover) and (pointer: fine)`. On a touch screen `:hover` sticks
after the tap and the button stays lit.

The hero keeps a quiet staggered arrival on load — **plain CSS keyframes**,
opacity + 10 px, 70 ms apart, declared only inside
`prefers-reduced-motion: no-preference`. It used to be GSAP; see the
dependencies note above for why 70 KB of vendored library for four elements was
the wrong trade. It is deliberately understated so it does not compete with the
report. An earlier version faded every `.sec` in on scroll through
ScrollTrigger — nine repetitions of one entrance read as a template, and they
hid everything below the fold until the visitor scrolled. Do not bring that
back.

Easing is one token, `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, and every
entrance and control response uses it. The built-in `ease-out` is too weak to
read as intentional; a second curve on the same page reads as two systems.

## Footguns hit in this codebase

These are real bugs that shipped here. Re-check them when touching related code.

- **Fonts without Cyrillic.** Space Grotesk has no `U+04xx` range at all, so Russian text silently fell back to a per-OS system font while Latin rendered in Space Grotesk — a mixed-font page. Before adding any font: `curl -s <fontsource css> | grep -c 'U+04'`.
- **`padding` shorthand on an element that also has `.wrap`.** `.wrap` supplies horizontal padding; a later same-specificity rule using the `padding` shorthand zeroes it, and content sits flush at `x=0` on every viewport ≤1200px. `.sec` / `.hero` / `.final` therefore use `padding-block`.
- **`grid-template-columns: repeat(auto-fit, …)` and odd child counts.** Borders now sit on the cards themselves, so an unfilled cell no longer paints a stray box — but it still leaves a visible hole. `.steps` had five children in a four-column grid and the fifth card sat alone beside three empty columns; it carried `.ongoing` and spanned `1 / -1` until that step was cut. Check child count against the column count at every breakpoint, not just the widest.
- **`[hidden]` losing to an author `display` rule.** `.overlay{display:flex}` beat the UA `[hidden]{display:none}` at equal specificity, leaving an invisible full-page layer that swallowed every click and drag on the site. `.ovl[hidden]{display:none}` is the guard.
- **A header nav that never shrinks.** `.hdr nav` held its full 473px on every viewport, so below 760px it pushed the document wider than the screen and the menu links sat off-canvas, unreachable. `.nav-a` is hidden below 760px and `.hdr-cta` below 430px; every section is still reachable by scrolling.
- **Markup and dictionary shipping out of step.** `index.html` and `js/main.js` are separate files with separate 600s caches, so adding i18n keys to both at once still leaves a window where a visitor holds new markup and the old dictionary — and the page renders raw `exp.s6k` strings. Two guards now exist and both must stay: local `css/js` are linked with `?v=<date>` (**bump it whenever you change those files**), and `applyLang` skips keys the dictionary lacks, leaving the Russian text baked into the markup. Verifying over `file://` cannot see this class of bug — load the deployed URL, or stub an older `main.js` with Playwright's `page.route`.

- **`border-radius` inside the global `:focus-visible` rule.** `:focus-visible { outline: …; border-radius: 4px }` does not round the focus ring — it rounds *the element*, so every 8 px button snapped to 4 px the moment it took keyboard focus. Outlines already follow the element's own radius; the rule now sets outline only.
- **A CSS animation that interpolates a value to itself.** A keyframe with only a `from` block takes its end value from the element's current computed style. With the "hidden" class still applied, `from { opacity: 0 }` animated to the base `opacity: 0` — the sequence silently did nothing and the content just appeared when the classes came off. Write both ends of the keyframe, and drop the hiding class in the same tick the animation starts.
- **Media queries placed before the base rule they override.** A `@media (max-width: 430px){ .hero{padding-block:28px} }` written up in the header section silently lost to the plain `.hero{padding-block:clamp(...)}` further down the file — same specificity, later wins. The mobile hero CTA stayed below the fold and the rule looked correct in review. Put a breakpoint override **after** the rules it overrides, not wherever the topic feels related.
- **`border-right` and `box-shadow` on a `<td>` under `border-collapse: collapse`.** Neither paints. The sticky first column in `.alt-table` needed `scroll-snap` on the wrapper instead, which is the better answer anyway: it stops the scroll landing mid-column, so fragments of a half-scrolled column never sit next to the row label.

Breakpoints are `900 / 760 / 620 / 430` and are **not** written in descending order; they currently touch disjoint properties, so verify cascade order if you add rules that overlap.

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
