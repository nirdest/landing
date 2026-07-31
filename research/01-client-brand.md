# Client Brand Extraction — VibeOps

Source: extracted directly from the repo's `index.html` (canonical source of truth —
more accurate than scraping the rendered GitHub Pages copy, since it exposes the raw
CSS custom properties, the full i18n dictionary, and structural comments).

## Brand Snapshot
- **Company:** VibeOps
- **Owner:** solo consultant, name not yet disclosed (`[YOUR_NAME]` placeholder in JSON-LD)
- **Primary Color:** #00A857 (accent green)
- **Secondary Color:** #00703A (accent-deep, darker green — used for text accents, CTAs, borders)
- **Background:** #F5F2EA (warm cream), #FAF8F1 (bg-2), #FFFDF7 (card)
- **Ink:** #15170F (near-black), #454940 (ink-2), #71756A (muted)
- **Danger/degraded state:** #B23A22 (terracotta-red, used only in the before/after comparison)
- **Fonts:** Inter Variable (sans, body+headings) / JetBrains Mono (labels, eyebrows, mono UI text)
- **Tone:** Direct, confident, no fluff. Short sentences. Numbers over adjectives.
- **Core Message:** "Ускорение сайтов, снижение расходов на облако, надёжный production. Диагностика бесплатно — оплата только за результат." (Free diagnostics; pay only for measured results.)

## Logo
- Type: wordmark + icon (a stylized "M"/mountain-peak glyph with three route dots, rendered as inline SVG — no external logo file)
- Format: inline SVG, defined twice (favicon `data:image/svg+xml` and header `<svg>`)
- Single variant only, no dark-background alternate

## Color Palette (from `:root` custom properties)
| Token | Hex | Usage |
|---|---|---|
| --bg | #F5F2EA | page background |
| --bg-2 | #FAF8F1 | hover backgrounds |
| --card | #FFFDF7 | cards, panels |
| --ink | #15170F | primary text |
| --ink-2 | #454940 | secondary text |
| --muted | #71756A | tertiary/label text |
| --line | #E4DFD0 | hairline borders |
| --line-2 | #CEC7B4 | stronger borders |
| --acc | #00A857 | accent (dots, highlights) |
| --acc-deep | #00703A | CTAs, links, em accents |
| --acc-soft | rgba(0,168,87,.08) | badge backgrounds |
| --danger | #B23A22 | "before"/degraded state only |

## Typography
- **Headings:** Inter Variable, weight 640–660, letter-spacing -.025em to -.038em
- **Body:** Inter Variable, 400, line-height 1.6
- **Mono/labels:** JetBrains Mono, 400–500, used for eyebrows, stat captions, nav lang switch, SVG diagram labels
- **Source:** self-hosted via jsDelivr (`@fontsource-variable/inter`, `@fontsource/jetbrains-mono`), not Google Fonts
- Verified Cyrillic coverage (CLAUDE.md footgun note — previous font choice silently fell back per-OS for RU text)

## Content Summary
- **Homepage headline (RU):** "Быстрые сайты, меньший счёт за облако и *продакшен, который не падает*."
- **Homepage headline (EN, inferred from i18n keys):** parallel structure, same value prop
- **CTA copy:** "Оставить контакт" (primary), "Что именно я делаю" (secondary, scroll to services)
- **Value props:** free diagnosis, pay-for-result billing, before/after infra comparison, 8+ years IT / 5+ years DevOps
- **Differentiator:** explicitly targets AI-prototype productionization — "Проекты на Lovable, Bolt, Cursor или Claude Code довожу до состояния, в котором их не страшно открыть пользователям" (service card 06, FAQ q4)
- **Tone analysis:** confident but not salesy; leads with risk reversal (free diagnosis, no-pay-if-can't-help) rather than feature lists; uses concrete technical nouns (CDN, Kubernetes, Terraform) instead of vague benefit language
- **Word count (homepage, RU):** ~750 words across hero, comparison, 6 service cards, 4 process steps, experience block, 6 FAQ entries, final CTA

## Site Architecture
- Single page (`index.html`), no routing — all sections are in-page anchors
- Sections in order: header → hero → before/after infra comparison (custom SVG diagram + slider) → services (6 cards) → process (4 steps) → experience (stats + stack) → FAQ (6 items) → final CTA → footer → lead-capture modal
- **Total pages:** 1
- **Depth:** 0 clicks (single scroll + anchor nav)
- i18n: client-side RU/EN toggle via `data-i18n*` attributes, RU is default, no localized routes
- No blog, no case studies, no testimonials, no pricing page — deliberately minimal per CLAUDE.md ("don't invent case studies")

## Known gaps (per CLAUDE.md "Unfinished" section — treat as real, not assumptions)
- `[YOUR_DOMAIN]`, `[YOUR_HANDLE]`, `[YOUR_NAME]` placeholders unresolved (canonical URL, OG, JSON-LD, footer links, email)
- Lead form is simulated client-side, no real backend endpoint
- Tech stack in Experience section (AWS, Kubernetes, Terraform, Prometheus/Grafana, GitHub Actions/GitLab CI) is **inferred, not confirmed by the owner**
- No social proof, testimonials, or case studies exist or should be fabricated
