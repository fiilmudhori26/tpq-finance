---
name: Amanah Financial Interface
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#535f58'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7770'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d9e6dd'
  tertiary-fixed-dim: '#bdcac1'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4943'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-page: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system is engineered for "TPQ Finance," a specialized financial management platform for Islamic educational institutions. The brand personality is rooted in **Trust (Amanah)**, **Clarity**, and **Modernity**. 

The aesthetic blends **High-End Minimalism** with **Glassmorphism** touches to create an environment that feels premium yet accessible. It prioritizes data legibility and administrative ease, utilizing generous whitespace to reduce cognitive load during complex financial tasks. The emotional response should be one of calm confidence and professional reliability.

## Colors
The palette is centered around a professional Emerald Green, symbolizing growth and Islamic values, balanced by deep slates for authoritative typography.

- **Primary (#059669):** Used for primary actions, success states, and brand signifiers.
- **Secondary (#0F172A):** A deep navy-slate used for navigation backgrounds and high-contrast headings.
- **Surface/Background (#F9FAFB):** A crisp, clean off-white that serves as the canvas for all cards and modules.
- **Accents:** Subtle use of glass-like transparencies (White at 60-80% opacity) for overlay components and secondary containers.

## Typography
This design system utilizes **Geist** for its technical precision and modern, airy feel. The type hierarchy is strictly enforced to ensure financial data is scannable.

- **Numerical Data:** Use tabular figures (tnum) for financial tables to ensure currency alignment.
- **Headings:** Use semi-bold weights for section titles (e.g., "Laporan Keuangan") to establish clear information hierarchy.
- **Language:** All micro-copy and labels must adhere to formal Bahasa Indonesia (EYD) to maintain professional integrity.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. Content is centered within a 1280px max-width container for desktop, while utilizing a 12-column grid system.

- **Desktop:** 12 columns, 24px gutters, 32px side margins.
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 16px gutters, 16px side margins.

Use "Vertical Rhythm" spacing (increments of 8px) to separate dashboard widgets. Ensure heavy use of padding (minimum 24px) within cards to maintain the minimalist, premium feel.

## Elevation & Depth
Depth is achieved through a combination of **Tonal Layering** and **Ambient Shadows**. 

1.  **Level 0 (Base):** Background color `#F9FAFB`.
2.  **Level 1 (Cards):** Pure white `#FFFFFF` surfaces with a "Soft Bloom" shadow (0px 4px 20px rgba(0, 0, 0, 0.03)).
3.  **Level 2 (Modals/Overlays):** White with 70% opacity backdrop-blur (12px) and a more pronounced shadow (0px 12px 40px rgba(0, 0, 0, 0.08)).

Avoid harsh black shadows; use the Primary Green or Secondary Slate mixed into the shadow color at very low opacity (2-3%) to keep the UI feeling "organic."

## Shapes
The shape language is defined by large, welcoming radii that soften the professional "seriousness" of financial management.

- **Standard Elements:** 0.5rem (8px) for buttons and input fields.
- **Container/Cards:** Use `rounded-xl` (1.5rem / 24px) as the default for all dashboard widgets and main content areas.
- **Interactive States:** Subtle expansion (1-2px) or slight scale-up on hover for cards to indicate interactivity.

## Components

### Buttons
- **Primary:** Solid Emerald Green with white text. High-contrast, 8px radius.
- **Secondary:** Ghost style with a 1px border of `#E5E7EB` and primary color text.
- **Sizing:** Large touch targets (48px height) for all primary actions.

### Cards (Kartu)
- All main dashboard data (e.g., "Total Infaq", "Sisa SPP") must be housed in 24px rounded white cards.
- Internal padding must be exactly 32px to provide a premium "gallery" feel.

### Input Fields
- Backgrounds should be white with a subtle `#E5E7EB` border.
- On focus: 2px Emerald Green border with a soft green outer glow (ring).
- Labels should be positioned above the input in `label-sm` style.

### Tables (Tabel Keuangan)
- Remove all vertical borders. Use horizontal dividers with `#F3F4F6`.
- Header row should have a subtle gray background (`#F9FAFB`) with semi-bold text.

### Chips/Badges
- Status indicators (e.g., "Lunas", "Menunggu Paymen") use soft-tinted backgrounds: light green background with dark green text for "Lunas". 
- Radii should be pill-shaped (full round).