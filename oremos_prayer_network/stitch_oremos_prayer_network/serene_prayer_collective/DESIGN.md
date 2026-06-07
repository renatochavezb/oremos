---
name: Serene Prayer Collective
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#42474d'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#73777e'
  outline-variant: '#c2c7ce'
  surface-tint: '#3f627f'
  primary: '#3d5f7c'
  on-primary: '#ffffff'
  primary-container: '#567896'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a8caec'
  secondary: '#6b5584'
  on-secondary: '#ffffff'
  secondary-container: '#e3c7fe'
  on-secondary-container: '#67507f'
  tertiary: '#5c5c58'
  on-tertiary: '#ffffff'
  tertiary-container: '#757571'
  on-tertiary-container: '#fefcf7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#a8caec'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#264a66'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#d7bcf2'
  on-secondary-fixed: '#26113c'
  on-secondary-fixed-variant: '#533d6b'
  tertiary-fixed: '#e4e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#474744'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is centered on the concepts of "Spiritual Stillness" and "Collective Peace." It is designed to facilitate a meditative state for users engaging in prayer and reflection. The target audience seeks a sanctuary away from the noise of typical social platforms, requiring a UI that feels like a digital chapel or a quiet morning.

The aesthetic blends **Minimalism** with **Glassmorphism**. It utilizes expansive white space to allow content to "breathe," while employing soft, translucent layers and ethereal glows to signify the spiritual nature of the interactions. Every transition should be fluid and slow, avoiding jarring movements to maintain the atmosphere of tranquility.

## Colors
The palette is rooted in the natural transitions of the sky during dawn and dusk.
- **Primary (Soft Blue):** Used for primary actions and state indicators, representing calm and clarity.
- **Secondary (Warm Amethyst):** Used for spiritual milestones, "Amen" interactions, and prayer highlights, evoking a sense of the sacred.
- **Tertiary (Gentle Cream):** The foundational surface color, replacing harsh whites with a warmer, more organic tone.
- **Neutral:** A soft charcoal for text to ensure high legibility without the starkness of pure black.
- **Ethereal Glow:** A very light, luminous blue used for background blurs and active states to suggest divine light.

## Typography
The typographic scale balances tradition with modern accessibility.
- **Headlines (EB Garamond):** Chosen for its classical proportions and historical weight. It should be used for prayer titles, scripture quotes, and section headers.
- **Body & Labels (Plus Jakarta Sans):** A friendly, modern sans-serif that ensures the user's focus remains on the content. The slightly rounded terminals of Plus Jakarta Sans complement the soft edges of the UI.
- All labels should use a slightly increased letter spacing to enhance the feeling of "breathability."

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop to maintain a focused, centered experience that feels like a page in a book.
- **Desktop:** 12-column grid with wide 64px margins to push content toward the center, minimizing eye strain.
- **Mobile:** 4-column grid with 20px margins.
- **Spacing Rhythm:** Based on an 8px base unit. Use generous vertical padding (64px+) between major sections to emphasize a slow, deliberate pace. Elements should never feel crowded; when in doubt, increase the whitespace.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Backdrop Blurs** rather than heavy shadows.
- **Surface Level:** Cream background (#F9F7F2).
- **Raised Level:** White containers with a very soft, diffused shadow (15% opacity Primary color, 20px blur) to create a "floating" effect.
- **Glass Level:** For overlays and navigation bars, use a semi-transparent white (70% opacity) with a 12px backdrop blur. This creates a "frosted glass" look that allows the soft background gradients to peek through, suggesting light passing through a veil.
- **Interactive Depth:** When a prayer card is "held" or focused, increase the shadow spread and add a subtle outer glow using the Secondary amethyst color.

## Shapes
The shape language is organic and soft.
- **Containers:** Use `rounded-lg` (16px) for cards and main UI blocks.
- **Small Elements:** Use `rounded-md` (8px) for buttons and input fields.
- **Avatars:** Always circular to represent wholeness and community.
- **Interactive Glows:** Use large, soft-edged radial gradients in the background to break up the linear structure of the grid.

## Components
- **Buttons:** Primary buttons use a solid Soft Blue with white text. Secondary buttons are "Ghost" style with a thin Soft Blue border. All buttons should have a subtle hover state that introduces a soft glow effect.
- **Prayer Cards:** Large, white containers with generous internal padding (32px). Use the Serif font for the prayer text and the Sans-serif for the author's name.
- **Chips/Tags:** Used for prayer categories (e.g., "Healing," "Gratitude"). These should have a light amethyst background and no border.
- **Input Fields:** Minimalist design; only a bottom border that glows when focused. The placeholder text should be in a light italicized serif to feel like a gentle prompt.
- **The "Amen" Button:** A unique component that, when pressed, triggers a subtle pulse of Amethyst light that radiates from the button, providing haptic-like visual feedback of spiritual connection.
- **Progress Indicators:** Use soft, slow-filling gradients instead of solid bars for prayer chains or streaks.