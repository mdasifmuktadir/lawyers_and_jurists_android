# The Lawyers & Jurists — Project Styling Guide

> Drop this file into your repo as `.github/copilot-instructions.md` (or reference it from Copilot Chat) so that GitHub Copilot follows this brand system when generating UI code, components, and styles.

## Brand Reference

Source: firm logo — a circular laurel-wreath monogram ("LJ") in black and gold, paired with serif wordmark "The Lawyers & Jurists" and a sans-serif tagline "Barristers, Advocates & Legal Consultants." The overall impression is **traditional, legal, trustworthy, understated luxury** — avoid anything playful, bright, or "startup-y."

## 1. Color Palette

Extracted directly from the logo asset (exact pixel sampling):

| Role | Hex | RGB | Usage |
|---|---|---|---|
| **Primary Gold/Bronze** | `#A27440` | 162, 116, 64 | Brand accent — headings, links, borders, icons, CTAs (secondary) |
| **Ink Black** | `#000000` | 0, 0, 0 | Primary text, logo linework, high-emphasis elements |
| **Pure White** | `#FFFFFF` | 255, 255, 255 | Base background |
| **Warm Gold (light)** | `#A87D4C` | 168, 125, 76 | Hover/active states on gold elements |
| **Champagne** | `#E8DCCF` | 232, 220, 207 | Subtle section backgrounds, cards, dividers |
| **Taupe** | `#B99770` | 185, 151, 112 | Muted secondary text, captions |
| **Soft Sand** | `#D6C2AB` | 214, 194, 171 | Borders, disabled states |

### Suggested semantic tokens (CSS custom properties)
```css
:root {
  --color-primary: #A27440;       /* gold/bronze — brand accent */
  --color-primary-hover: #8C6236; /* darker gold for hover */
  --color-primary-light: #A87D4C;
  --color-ink: #000000;           /* primary text */
  --color-ink-soft: #1A1A1A;      /* body text, slightly softened black */
  --color-background: #FFFFFF;
  --color-surface: #E8DCCF;       /* cards, panels */
  --color-muted: #B99970;         /* secondary text */
  --color-border: #D6C2AB;
  --color-success: #4C6B4F;       /* muted forest green — fits legal/serious tone */
  --color-error: #8B3A3A;         /* muted brick red */
}
```

**Rule of thumb:** black and white carry the page; gold is an *accent*, not a fill color. Never use gold as a large background block — reserve it for borders, rules, icons, links, and small UI details (like the logo itself does).

## 2. Typography

The logo pairs a **serif wordmark** with a **sans-serif tagline** — mirror this two-family system:

| Use | Font stack | Notes |
|---|---|---|
| **Headings / brand moments** (H1, H2, firm name, hero text) | `'Playfair Display', 'Georgia', 'Times New Roman', serif` | Elegant serif matching the wordmark's gravitas |
| **Body text / UI** (paragraphs, forms, nav, buttons) | `'Inter', 'Helvetica Neue', Arial, sans-serif` | Clean sans-serif matching the tagline |
| **Legal/document content** (long-form case text, clauses) | `'Merriweather', Georgia, serif` | Optional — improves long-form readability |

### Type scale
```css
--font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
--font-sans: 'Inter', 'Helvetica Neue', Arial, sans-serif;

--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.5rem;
--text-2xl: 2rem;
--text-3xl: 2.75rem;

--leading-tight: 1.2;
--leading-normal: 1.6;
--letter-spacing-wide: 0.04em; /* use sparingly on all-caps labels, like the tagline */
```

- Headings: serif, tight leading, normal weight or semi-bold (avoid ultra-bold — the logo wordmark is not heavy).
- Tagline-style labels (e.g. nav categories, section eyebrows): sans-serif, small size, uppercase, wide letter-spacing — mirrors "BARRISTERS, ADVOCATES & LEGAL CONSULTANTS."
- Body copy: sans-serif, `--leading-normal`, ink-soft color, never pure gold on white (fails contrast/readability).

## 3. Logo Mark & Iconography

- The emblem is a **circular monogram inside a laurel wreath** — a visual motif you can echo:
  - Use circular badges/avatars where appropriate (attorney profile photos, certification icons).
  - A thin gold rule/divider (1–2px, `--color-primary`) under headings echoes the wreath's disciplined linework.
- Keep iconography **line-style, minimal, single-color** (black or gold) — no filled/flat colorful icon sets. Think: scales of justice, gavel, document, seal — rendered as thin outline icons.

## 4. Layout & Component Principles

- **Whitespace-forward**: generous margins/padding; the logo itself sits in a lot of open space. Avoid dense, cramped layouts.
- **Borders over shadows**: prefer thin `1px solid var(--color-border)` outlines and gold rule-lines over heavy drop shadows — feels more "letterhead," less "app."
- **Buttons**:
  - Primary: black background, white text, subtle gold border or gold underline on hover.
  - Secondary: white background, black text, `--color-primary` border.
  - Avoid rounded-pill buttons; use small/moderate border-radius (2–6px) or square corners for a formal, legal-document feel.
- **Cards/panels**: `--color-surface` (champagne) or white background, `--color-border` outline, generous padding, serif heading + sans-serif body.
- **Dividers**: thin gold (`--color-primary`) or sand (`--color-border`) horizontal rules, not full-width heavy lines.
- **Corner radius scale**: `--radius-sm: 2px; --radius-md: 4px; --radius-lg: 8px;` — keep it conservative.

## 5. Tone in UI Copy

- Formal, precise, no slang or exclamation-heavy microcopy.
- Prefer "Submit Inquiry" over "Let's go!"; "Schedule a Consultation" over "Book now 🎉".
- Error/empty states: calm and factual, not cutesy.

## 6. Quick-reference summary for Copilot prompts

When asking Copilot to generate a component, you can prepend:

> "Style this using the firm's brand system: black (#000000) and white (#FFFFFF) as the base palette, gold/bronze (#A27440) as the sole accent color used sparingly for borders/links/icons, serif headings (Playfair Display), sans-serif body (Inter), generous whitespace, thin rule-lines instead of shadows, minimal line-style icons, formal legal tone. See `.github/copilot-instructions.md` for full details."

---
*Colors were sampled directly from the provided logo file for accuracy. Adjust `--color-success` / `--color-error` if the firm has existing status-color conventions elsewhere in the product.*
