# Website Build Brief — VibeOps

Phase 4 of the website-intelligence process. Synthesizes `01-client-brand.md` and
`02-competitor-analysis.md` into a concrete, approvable build plan.

**Note on scope vs. CLAUDE.md:** this brief recommends splitting the current single
`index.html` into `site/index.html` + separate `css/`/`js/` files (to host GSAP
ScrollTrigger animations per the website-intelligence skill's Phase 5 spec), which
is a deliberate, explicit departure from this repo's existing "one file, no
dependencies but fonts" rule. That departure was confirmed by the user before this
research started. It does **not** mean adding more pages — see Site Architecture
below, where the research argues for keeping the single-page structure.

---

## Design Direction

**Palette — keep as-is, don't repaint.** Warm cream `#F5F2EA` / ink `#15170F` /
green accent `#00A857`–`#00703A` already sits closer to the competitive top tier
than most of the set: Pelotech (the #4 scorer and VibeOps's closest direct
competitor on the AI-prototype wedge) uses a near-identical warm cream
(`#F4F2EF`) and shares Inter as a body font. The palette is a validated choice,
not a guess.

**Typography — keep Inter Variable + JetBrains Mono.** Confirmed full-Cyrillic
coverage (a real footgun already hit once in this codebase). Distinctive
typography is one of the few things that visibly separated the top 2 scorers
(Duckbill, MeteorOps) from the rest — VibeOps doesn't need to buy a licensed font
to get this benefit; a monospace label type paired with a variable sans is
already an above-average choice for this niche.

**Visual identity — keep the SVG topology diagram, don't add stock photography.**
None of the 10 competitors reviewed have an equivalent interactive system diagram;
it is VibeOps's most distinctive existing asset. Don't dilute it with generic
photography or icon-grid busywork.

**Animation recommendations:**
- GSAP ScrollTrigger fade/translateY reveal on each `.sec` boundary (matching the
  motion language of `references/process-overview.html`: 20px translate, 0.7s ease)
- Subtle parallax on the topology diagram's node groups as the comparison section
  scrolls into view (depth, not distraction)
- Keep the existing drag-slider before/after interaction untouched — it's unique
  in the competitive set and shouldn't be replaced with a scroll-triggered
  auto-play; user-controlled comparison is the point
- Respect `prefers-reduced-motion` throughout (already a repo convention)

**What to avoid** (observed failure modes in the competitor set):
- AppRecode's dark neon "AI startup" aesthetic — generic, and its logo wall
  (BMW, Huawei, Nvidia) reads implausible for the site's apparent scale, a
  credibility risk worth naming explicitly so VibeOps never drifts there
- Duckbill's pivot-in-progress feel — an enterprise-SaaS visual register that
  doesn't match a startup/SMB-facing solo consultant
- StackTrack's FAQ-behind-JS-accordion pattern — VibeOps's native `<details>`
  FAQ is already better for crawlability; don't regress this in the rebuild

---

## Site Architecture

**Keep it a single page.** This is a research-backed decision, not an unexamined
holdover: the top 3 competitors by search visibility (MeteorOps, Duckbill,
StackTrack) all win long-tail search through programmatic multi-page architecture
(services × delivery model, services × cloud provider, etc.) — 45-48+ URLs each.
That structure is irrelevant to a solo consultant's actual sales motion and would
contradict the site's own positioning (a focused specialist, not an agency with a
content team). The single-page constraint is a considered choice; expanding page
count is not the fix for VibeOps's search-visibility ceiling.

**File structure** (the one real architectural change, needed to host GSAP):
```
site/
├── index.html          — markup + i18n data only
├── css/styles.css       — all current inline CSS, unchanged content
├── js/main.js           — existing i18n / modal / slider / packet-animation logic
├── js/animations.js     — new GSAP ScrollTrigger reveal/parallax setup
└── assets/              — favicon svg, og-image (currently inline/missing)
```
GSAP + ScrollTrigger loaded from a CDN `<script>` tag (same pattern already used
for fonts) — no npm, no build step, no bundler. This keeps the "no build step"
property of the current site even though it's no longer a single file.

**Navigation:** unchanged — `#compare #services #process #experience #faq`
anchors, same header.

**New content additions within the existing sections** (not new pages):
1. A short **"What I won't do"** block, placed after the before/after comparison
   and before Services (pattern 2 — StackTrack's highest-signal, lowest-cost
   device). 3–4 one-line commitments in VibeOps's existing confident tone.
2. The Process section's step 1 ("Диагностика") gets **named and scoped**
   instead of generic (pattern 1 — MeteorOps/StackTrack). Give it a concrete
   name and 2-3 named deliverables, not a vague promise.
3. A compact **alternatives comparison** near the FAQ or final CTA (pattern 2/
   Pelotech's strongest asset) — VibeOps vs. 2-3 named alternatives a real buyer
   is actually weighing.

## Content Framework

**Homepage headline — 3 options**, each using a formula validated by a top-5
competitor, none requiring a fabricated metric:

1. **Keep current** (benefit-led, already good): *"Быстрые сайты, меньший счёт
   за облако и продакшен, который не падает."*
2. **Selectivity-led** (MeteorOps's funnel-stat pattern, adapted to something
   VibeOps can actually claim — solo capacity, not a fake vetting number):
   *"Один инженер, один проект за раз. Никакой команды джуниоров на вашем
   продакшене."*
3. **Named-diagnostic-led** (StackTrack/Pelotech pattern): *"Бесплатный аудит
   инфраструктуры — конкретный план за 48 часов, а не 'давайте созвонимся'."*

**Value-prop structure:** problem (slow / expensive / fragile) → named free
diagnostic with scoped deliverables → what I won't do → pay only for result.

**Section-by-section copy direction:**
- Hero: keep current headline (option 1) unless the owner prefers option 2/3;
  no structural change otherwise
- New "What I won't do" block: 3-4 lines, matching existing FAQ tone — direct,
  first-person, no hedging
- Process step 1: rename from generic "Диагностика" to a named artifact (e.g.
  "Инфраструктурный аудит" as a proper noun) with a short bullet list of what
  the client receives — findings, cost breakdown, priority list
- New alternatives table: 3 columns (VibeOps vs. "чинить самому промптами" vs.
  "нанять дешёвого фрилансера" vs. "ничего не делать"), 4-5 comparison rows tied
  to VibeOps's actual pitch (root-cause fix, pay-for-result, no lock-in)

**SEO keyword targets:**
- "production-ready" + named AI builder tools (Lovable, Bolt, Cursor, Claude
  Code) — genuinely open: Pelotech is the only competitor targeting this
  exact intersection and their page is `noindex, nofollow`
- "DevOps консультант" / "FinOps консультант" (RU market)
- "pay for result devops consulting" / "free infrastructure audit" (EN market)
- Resolve the `[YOUR_DOMAIN]`/`[YOUR_NAME]` placeholders — JSON-LD is already
  present and ahead of several lower-tier competitors who have no schema at all,
  but it's inert until real values are filled in

## Conversion Playbook

**Primary conversion goal:** unchanged — one contact captured via the existing
lead modal (email / Telegram / LinkedIn / phone).

**Lead capture strategy:** keep the single-field modal as-is. Do **not** copy
MeteorOps/StackTrack's multi-stage funnel (assessment quiz → call → engagement
tiers) wholesale — those are staffed agencies with sales capacity; replicating a
4-stage funnel for a solo consultant would be over-engineering the pattern rather
than adopting its actual lesson. The lesson to take is narrower: *name* the free
step (see Process section change above), don't build a separate interactive tool
around it.

**Social proof plan:** none exists yet, and per CLAUDE.md and pattern 5 of the
competitor research, **nothing should be fabricated** — the lower-tier
competitors' weakest trait is exactly unattributed round numbers ("300+
projects"). Recommendation: no placeholder testimonials, no fake logos. If the
owner wants a social-proof section, leave a clearly commented placeholder
(`<!-- TESTIMONIAL SLOT — do not fill with fabricated content -->`) for genuine
future testimonials rather than building empty infrastructure for them now.

**Trust signal checklist:**
- [ ] Free diagnosis reframed as a named artifact (see Process change)
- [ ] "What I won't do" block added
- [ ] Alternatives comparison table added
- [ ] Before/after topology diagram retained unchanged (unique differentiator)
- [ ] JSON-LD placeholders resolved once owner provides real name/domain/handle
- [ ] No fabricated metrics, logos, or testimonials anywhere

---

## HARD STOP — APPROVAL CHECKPOINT

Nothing below this line has been built yet. Before any rebuild starts:

1. **File-structure change** — splitting `index.html` into `site/index.html` +
   `css/` + `js/` + GSAP via CDN. Confirm this is really wanted; it's a real
   departure from this repo's current "one file, zero dependencies but fonts"
   rule, and the CLAUDE.md footguns list (padding shorthand, `[hidden]` cascade,
   grid auto-fit) will need re-verifying against whatever new file layout is
   chosen.
2. **Headline** — keep current, or switch to option 2 or 3 above?
3. **New content blocks** — approve/adjust: "What I won't do" list, named
   diagnostic artifact, alternatives comparison table. These need real content
   decisions only the owner can make (what VibeOps actually won't do; what the
   audit actually delivers).
4. **3D hero placeholder** — per the skill's Phase 5 spec, a scroll-triggered 3D
   asset placeholder should be added to the hero. Needs a decision on
   size/placement since the current hero has no image at all today.

**Ready to build?**
