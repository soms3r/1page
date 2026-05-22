---
name: Terminal AI
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9ccb2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#84967e'
  outline-variant: '#3b4b37'
  surface-tint: '#00e639'
  primary: '#ebffe2'
  on-primary: '#003907'
  primary-container: '#00ff41'
  on-primary-container: '#007117'
  inverse-primary: '#006e16'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#fff8f4'
  on-tertiary: '#442b10'
  tertiary-container: '#ffd5ae'
  on-tertiary-container: '#7a5b3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72ff70'
  primary-fixed-dim: '#00e639'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#00530e'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#e7bf99'
  on-tertiary-fixed: '#2c1701'
  on-tertiary-fixed-variant: '#5d4124'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.6'
spacing:
  base: 4px
  gutter: 16px
  margin: 24px
  column_count: '12'
  max_width: 1440px
---

## Brand & Style
This design system is engineered for AI developers and power users who prioritize efficiency, logic, and low-latency workflows. The aesthetic is a fusion of **Modern Minimalism** and **High-Tech Brutalism**, drawing direct inspiration from terminal interfaces and IDE environments.

The UI avoids decorative flourishes, focusing instead on information density and functional clarity. It evokes a sense of "under-the-hood" access, making the user feel like they are interacting directly with the model's core logic. The emotional response is one of precision, authority, and professional technical capability.

## Colors
The palette is rooted in a "True Dark" philosophy to minimize eye strain and maximize contrast.

- **Backgrounds:** The primary surface is `#050505`, providing a deep, ink-black foundation.
- **Primary:** The classic "Terminal Green" (`#00FF41`) is used exclusively for primary actions, success states, and the command prompt symbol.
- **Secondary/Surfaces:** Grays are kept lean and cool-toned to define boundaries without breaking the dark immersion.
- **Accents:** High-saturation reds, yellows, and blues are reserved for status-specific badges (e.g., model compatibility and error logs).

## Typography
The system utilizes **JetBrains Mono** across all levels to maintain the developer-centric aesthetic. The monospaced nature of the font ensures that data, code, and logs align perfectly, reinforcing the sense of systematic order.

Headlines should be used sparingly, often in sentence case or all-caps to denote hierarchy. Body text is optimized for readability during long sessions of prompt engineering. Label styles are frequently uppercased with increased tracking to differentiate them from interactive text.

## Layout & Spacing
The layout follows a **Rigid Fluid Grid**. While the content expands to fill the viewport, the internal logic is governed by a strict 4px baseline grid.

- **Desktop:** A 12-column layout with 16px gutters. Elements should align to the grid lines to create a "windowed" terminal feel.
- **Mobile:** Transition to a single-column stack with 16px side margins. Large data tables should horizontally scroll rather than wrap to preserve column integrity.
- **Density:** This design system favors high information density. Padding is kept to the functional minimum to allow as much data as possible to be visible above the fold.

## Elevation & Depth
In this design system, depth is communicated through **Tonal Layering** and **Scanline Overlays** rather than traditional drop shadows.

- **Layers:** Use `#121212` for container backgrounds to sit slightly "above" the `#050505` base.
- **Outlines:** Elevation is reinforced with 1px solid borders in `#1A1A1A` or low-opacity green (`rgba(0, 255, 65, 0.2)`).
- **Scanlines:** A subtle, fixed-position SVG pattern of horizontal lines (3% opacity) should be applied to the top-most interactive layers (like modals or sidebars) to give them a CRT-monitor texture.
- **Active State:** Elements currently in focus are "elevated" by changing their border color to the primary green, rather than increasing their Z-index or shadow.

## Shapes
The shape language is **Sharp (0px)**. All buttons, cards, input fields, and badges use 90-degree corners. This reinforces the technical, uncompromising nature of a terminal interface. 

The only exception is for circular status indicators (pills) used specifically for "Live" or "Running" animations to provide a singular point of visual softness that draws the eye to active processes.

## Components
- **Buttons:** Primary buttons are solid `#00FF41` with `#050505` text. Secondary buttons are ghost-style with 1px primary green borders. Hover states should trigger a "glitch" or flicker effect (brief opacity shift).
- **Command Prompts:** Every input field must be preceded by a non-selectable green `$` or `> ` character.
- **Model Badges:** Use high-contrast color blocks. "Best" (Primary Green), "Good" (Info Blue), "Limited" (Warning Yellow). Text inside badges should be black or high-contrast white JetBrains Mono Bold.
- **Input Fields:** Flat backgrounds with 1px bottom-borders only. When focused, the border becomes a solid 1px primary green box.
- **Cards:** No shadows. Defined by a 1px border. Card headers should have a slightly lighter background (`#1A1A1A`) to separate them from the card body.
- **Lists:** Use monospaced bullet points (e.g., `-` or `*`) and ensure hover states highlight the entire row in a subtle gray to facilitate data scanning.