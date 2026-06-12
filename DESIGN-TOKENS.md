# Posh Pal — Design System

## Brand Identity

- **Mission**: Make reselling effortless with AI-powered tools
- **Vibe**: Premium · Modern · Trustworthy · Energetic
- **Voice**: Direct, confident, slightly playful ("Unleash the Bot")

---

## Color Palette

### Primary (Indigo)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary-50` | `#EEF2FF` | Backgrounds, hover states |
| `--color-primary-100` | `#E0E7FF` | Card borders, light fills |
| `--color-primary-200` | `#C7D2FE` | Hover border |
| `--color-primary-500` | `#6366F1` | Primary buttons, interactive elements |
| `--color-primary-600` | `#4F46E5` | Button hover, active states |
| `--color-primary-700` | `#4338CA` | Focus rings |
| `--color-primary-900` | `#312E81` | High-contrast text on light bg |

### Accent — Pro / Premium (Amber → Gold)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-400` | `#F59E0B` | Pro badge, premium highlights |
| `--color-accent-500` | `#D97706` | Pro hover states |
| `--color-accent-50` | `#FFFBEB` | Pro card background |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10B981` | Green stats, positive metrics |
| `--color-warning` | `#F59E0B` | Warning notes, alerts |
| `--color-danger` | `#EF4444` | Errors, destructive actions |
| `--color-info` | `#3B82F6` | Info badges, tips |

### Neutrals (Slate-based)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F8FAFC` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals |
| `--color-border` | `#E2E8F0` | Card borders, dividers |
| `--color-text-primary` | `#0F172A` | Headings, primary text |
| `--color-text-secondary` | `#64748B` | Body text, labels |
| `--color-text-muted` | `#94A3B8` | Placeholder, secondary labels |

---

## Typography

- **Font Family**: `Inter var, system-ui, -apple-system, sans-serif`
- **Headings**: `font-black` (900 weight) with tight tracking
- **Body**: `font-medium` (500) or `font-normal` (400)
- **Uppercase labels**: `text-[10px] font-black uppercase tracking-widest`

### Scale
```
xs:  0.75rem  (12px)  — Captions / badges
sm:  0.875rem (14px)  — Body small / nav
base: 1rem    (16px)  — Body text
lg:  1.125rem (18px)  — Sub-headings
xl:  1.25rem  (20px)  — Section headings
2xl: 1.5rem   (24px)  — Card titles
3xl: 1.875rem (30px)  — Page headings
4xl: 2.25rem  (36px)  — Hero / stats
```

---

## Spacing

- **Card Padding**: `p-4` (16px) mobile, `p-6` (24px) desktop
- **Section Gap**: `space-y-6` (24px)
- **Grid Gaps**: `gap-3` (12px) mobile, `gap-4` (16px) desktop
- **Content Max Width**: `max-w-2xl` (672px) for tool pages; `max-w-5xl` (1024px) for dashboard

---

## Shadows & Elevation

| Level | Token | Usage |
|-------|-------|-------|
| Flat | `shadow-sm` with `border border-slate-100` | Default cards |
| Hover | `shadow-md` `border-indigo-200` | Interactive cards on hover |
| Elevated | `shadow-xl` | Drawers, modals |
| Pro | `shadow-xl shadow-indigo-500/10` | Premium upgrade sections |

---

## Border Radius

- **Cards**: `rounded-2xl` (16px)
- **Buttons**: `rounded-xl` (12px)
- **Small elements**: `rounded-lg` (8px)
- **Icons inside cards**: `rounded-xl` (12px)
- **Pills / badges**: `rounded-full`

---

## Components Style Guide

### Navigation (Bottom Tab Bar)
- Fixed at bottom, `bg-white` with top border
- Active tab: primary color, inactive: `text-slate-400`
- Icons: `w-6 h-6`, labels: `text-[10px] font-black uppercase`

### Header
- Sticky top, `bg-white` with bottom border
- Logo: icon in `bg-primary-600 rounded-lg` + "Posh Pal" in `font-black italic uppercase`
- Pro button: subtle with notification dot

### Stat Cards (Dashboard)
- 3-column grid on mobile, equal widths
- Icon in colored circle (w-8 h-8), value in `text-xl font-black`
- Label in `text-[10px] font-black uppercase tracking-wider text-slate-400`

### Tool Cards (Dashboard Grid)
- 2 columns mobile, 3 columns desktop
- `bg-white rounded-2xl p-5` with border
- Icon in colored square `w-10 h-10 rounded-xl`
- Name: `text-sm font-bold`, description: `text-[10px]`

### Pro Upgrade Card
- Dark background (`bg-slate-900`) with `rounded-3xl`
- Background decorative icon (large, rotated, low opacity)
- Eye-catching CTA text in bold white italic
- "Limited Time" badge in accent
- Hover: subtle scale/transform on background icon

### Tool Content Pages
- Max width `max-w-2xl` centered
- Back button: `text-sm font-bold uppercase tracking-wider` with arrow
- All inputs: consistent `rounded-xl`, `border-slate-200`, focus ring `ring-2 ring-indigo-500`

---

## Animation & Micro-interactions

- **Hover scale**: `group-hover:scale-110 transition-transform` on icons
- **Fade in results**: `animate-in fade-in slide-in-from-bottom-4 duration-500`
- **Loading spinner**: `animate-spin` with primary color
- **Button hover**: smooth color transitions `transition-colors`
- **Card hover**: `hover:border-indigo-200 hover:shadow-md transition-all`

---

## Mobile-First Breakpoints

```
sm:  640px   — Larger phones
md:  768px   — Tablets
lg: 1024px   — Desktop
xl: 1280px   — Wide desktop
```

- **Default (mobile)**: single column, compact padding
- **md+ (tablet)**: 2-column grids
- **lg+ (desktop)**: 3-column grids, increased padding

---

## Accessibility

- All interactive elements have `cursor-pointer`
- Focus states use `outline-none` + `ring-2 ring-indigo-500`
- Color contrast ratios exceed WCAG AA for all text on backgrounds
- Touch targets minimum 44px (all buttons/nav items)
