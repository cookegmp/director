# Control UI Reference: Wizard Card Component

## Overview

This document describes the design system and interaction pattern for the primary input component in Control — a multi-step wizard card inspired by killorbuild.com. This is the central UI element users interact with for project intake, agent configuration, and consultation scaffolding.

Claude Code: read this file before building any wizard, intake form, or multi-step card component for the Control application.

---

## Tech Stack

| Layer      | Technology           | Notes                                                                                     |
| ---------- | -------------------- | ----------------------------------------------------------------------------------------- |
| Framework  | React (SPA via Vite) | No SSR. Standard `#root` mount.                                                           |
| CSS        | Tailwind CSS v3+     | Utility-first. Arbitrary values used for gradients.                                       |
| Components | shadcn/ui v2         | Full HSL token system (80+ CSS vars). Radix primitives underneath.                        |
| Icons      | Lucide React         | Standard 24px SVG icons.                                                                  |
| Font       | Inter                | `font-family: Inter, system-ui, sans-serif`                                               |
| Animations | Pure CSS             | No Framer Motion. `@keyframes` for gradients, `conic-gradient` rotation for borders.      |
| Particles  | Canvas element       | Full-screen `<canvas>` with `position: fixed; inset: 0; pointer-events: none; z-index: 0` |

---

## Color System (shadcn/ui v2 HSL Tokens)

All colors are HSL values set as CSS custom properties on `:root`. This enables opacity modifiers like `bg-card/50`.

### Core Palette

```css
:root {
  /* Base */
  --background: 225 64% 11%; /* Deep navy — NOT pure black */
  --foreground: 220 14% 96%; /* Near-white */

  /* Card surfaces */
  --card: 225 50% 15%; /* Slightly lighter navy */
  --card-foreground: 220 14% 96%;

  /* Primary action color */
  --primary: 217 100% 61%; /* Vivid blue */
  --primary-foreground: 0 0% 100%;

  /* Secondary / muted */
  --secondary: 225 30% 25%;
  --secondary-foreground: 220 14% 91%;
  --muted: 225 30% 20%;
  --muted-foreground: 220 14% 55%; /* Grey text for descriptions */

  /* Accent */
  --accent: 225 40% 22%;
  --accent-foreground: 220 14% 91%;

  /* Destructive */
  --destructive: 0 72% 51%;

  /* Borders & inputs */
  --border: 225 30% 20%; /* Subtle, same as muted */
  --input: 225 30% 20%;
  --ring: 217 100% 61%; /* Matches primary for focus rings */

  /* Global radius — IMPORTANT: pill shape by default */
  --radius: 9999px;
}
```

### Semantic Domain Colors

Define these for Control orchestration states:

```css
:root {
  /* Adapt from KillOrBuild's --go / --kill pattern */
  --active: 175 63% 47%; /* Teal — running/in-progress */
  --queued: 217 100% 61%; /* Blue — waiting/primary */
  --completed: 142 71% 45%; /* Green — success/done */
  --error: 0 72% 51%; /* Red — failed/destructive */
  --idle: 225 30% 20%; /* Muted — inactive */
}
```

### Gradient Colors (for text and borders)

Three-stop gradient used throughout:

- Blue: `hsl(217, 100%, 60%)` — `rgba(56, 132, 255)`
- Teal: `hsl(175, 80%, 55%)` — `rgba(44, 195, 183)`
- Rose/Purple: `hsl(263, 80%, 65%)` or Rose `rgba(229, 67, 99)`

---

## The Wizard Card Component

### Container Structure

```
Section wrapper (full viewport)
└── Card (glassmorphism + animated border)
    ├── Navigation bar (Back button + step dots)
    ├── Question heading (H2)
    ├── Textarea input (bottom-border only)
    ├── Suggestion tags (AI-generated, optional per step)
    ├── Action bar (OK button + Enter hint + Skip + Voice mic)
    └── Subtle helper text (optional, e.g. email step)
```

### Section Wrapper

```jsx
<section className="min-h-screen flex flex-col justify-center px-4 sm:px-8 py-8 sm:py-16 max-w-3xl mx-auto w-full">
  {/* Card goes here */}
</section>
```

Centers the card vertically and horizontally. `max-w-3xl` keeps it from getting too wide on desktop.

### Card Container (Animated Gradient Border)

The card uses a custom `animated-gradient-border` class that creates a rotating conic-gradient border effect using pseudo-elements.

```jsx
<div className="animated-gradient-border bg-card/50 backdrop-blur-sm rounded-xl p-6 sm:p-10">
  {/* Card content */}
</div>
```

#### CSS for Animated Gradient Border

```css
.animated-gradient-border {
  position: relative;
  overflow: visible;
  z-index: 0;
  border-radius: 12px; /* rounded-xl */
}

/* Rotating gradient border — the main visual effect */
.animated-gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px; /* This is the border width */
  background: conic-gradient(
    from 0deg,
    rgba(56, 132, 255, 0.6),
    /* Blue */ rgba(44, 195, 183, 0.5),
    /* Teal */ rgba(229, 67, 99, 0.4),
    /* Rose */ rgba(56, 132, 255, 0.3),
    /* Blue (faded) */ rgba(44, 195, 183, 0.5),
    /* Teal */ rgba(56, 132, 255, 0.6) /* Blue (loop) */
  );
  animation: gradient-rotate 4s linear infinite;
  /* Mask trick: only show the border edge, not the fill */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box exclude,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box exclude,
    linear-gradient(#fff 0 0);
}

/* Outer glow — subtle light bleed beyond the card */
.animated-gradient-border::after {
  content: '';
  position: absolute;
  inset: -4px; /* Extends beyond the card */
  border-radius: 16px;
  background: conic-gradient(
    from 0deg,
    rgba(56, 132, 255, 0.15),
    rgba(44, 195, 183, 0.1),
    rgba(0, 0, 0, 0),
    rgba(56, 132, 255, 0.08),
    rgba(44, 195, 183, 0.1),
    rgba(56, 132, 255, 0.15)
  );
  animation: gradient-rotate 4s linear infinite;
  z-index: -1;
  filter: blur(4px); /* Soft glow */
}

@keyframes gradient-rotate {
  100% {
    transform: rotate(360deg);
  }
}
```

**Key technique**: The `::before` uses a CSS mask to punch out the center, leaving only a 1px gradient border that rotates. The `::after` extends 4px beyond with very low opacity for the ambient glow.

### Navigation Bar (Step Dots + Back)

```jsx
<div className="flex items-center justify-center gap-2 mb-6">
  {/* Back button — hidden on step 1 */}
  {currentStep > 0 && (
    <button
      onClick={onBack}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm">Back</span>
    </button>
  )}

  {/* Step dots */}
  <div className="flex items-center gap-2">
    {steps.map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-colors ${
          i <= currentStep ? 'bg-primary' : 'bg-muted'
        }`}
      />
    ))}
  </div>
</div>
```

### Question Heading

```jsx
<h2 className="text-xl sm:text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-6">
  {currentQuestion}
</h2>
```

`font-light` is critical to the aesthetic. Keeps headings elegant, not heavy.

### Textarea Input (Bottom-Border Only)

This is the key interaction element. NOT a bordered input box — just a bottom line.

```jsx
<textarea
  value={answer}
  onChange={(e) => setAnswer(e.target.value)}
  placeholder="Type your answer here..."
  rows={1}
  className="w-full bg-transparent border-b-2 border-border focus:border-primary text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-3"
/>
```

**Design details**:

- `bg-transparent` — no background, the glassmorphism card shows through
- `border-b-2 border-border` — only bottom border, subtle
- `focus:border-primary` — blue underline on focus
- `placeholder:text-muted-foreground/40` — very faint placeholder (40% opacity)
- `resize-none` — textarea should auto-grow, not show resize handle
- `text-lg` — larger than default for readability

### Suggestion Tags (AI-Generated)

These appear on steps 2+ and are contextually generated based on previous answers. Clicking a tag fills the textarea.

```jsx
<div className="flex flex-wrap gap-2 mt-4">
  {suggestions.map((tag) => (
    <button
      key={tag}
      onClick={() => {
        setAnswer(tag)
        setSelectedTag(tag)
      }}
      className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
        selectedTag === tag
          ? 'border-primary text-primary' /* Selected: teal/blue border + text */
          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
      }`}
    >
      {tag}
    </button>
  ))}
</div>
```

**Behavior**: Clicking a tag populates the textarea AND highlights the tag. User can still edit the textarea text after a tag fills it. Tags are `rounded-md` (not pill) to differentiate from buttons.

### Action Bar

```jsx
<div className="flex items-center gap-3 mt-4">
  {/* Primary submit — gradient pill */}
  <button
    onClick={onSubmit}
    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm px-5 py-2 bg-gradient-to-r from-[hsl(217,100%,60%)] via-[hsl(175,80%,55%)] to-[hsl(263,80%,65%)] text-white font-medium active:scale-95 transition-transform"
  >
    {isLastStep ? 'Analyze' : 'OK'}
    <Check className="w-4 h-4" />
  </button>

  {/* Enter hint */}
  <span className="text-sm text-muted-foreground">
    press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
  </span>

  {/* Skip — shown on optional steps */}
  {isSkippable && (
    <button
      onClick={onSkip}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Skip <ArrowRight className="w-3 h-3" />
    </button>
  )}

  {/* Voice input — right-aligned */}
  <button className="ml-auto relative w-12 h-12 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
    <Mic className="w-5 h-5" />
  </button>
</div>
```

### Gradient Text Effect

For hero headings or emphasized text elsewhere in the app:

```css
.animated-gradient-text {
  background-image: linear-gradient(
    90deg,
    rgb(229, 67, 99),
    /* Rose */ rgb(56, 132, 255),
    /* Blue */ rgb(44, 195, 183) /* Teal */
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  animation: gradient-flow 4s ease-in-out infinite;
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

---

## Multi-Step Wizard Behavior

### State Management

The wizard maintains a simple state machine. The card container stays mounted across all steps — only the inner content swaps.

```typescript
interface WizardStep {
  id: string
  question: string
  placeholder?: string
  suggestions?: string[] // AI-generated, can be async
  required?: boolean // If false, Skip button appears
  inputType?: 'textarea' | 'email' | 'select'
  submitLabel?: string // Override "OK" text (e.g. "Analyze")
}

interface WizardState {
  currentStep: number
  answers: Record<string, string>
  isProcessing: boolean
}
```

### Step Transition Pattern

1. User fills input (typing or tag click) → clicks OK or presses Enter
2. Answer is stored in state by step ID
3. `currentStep` increments
4. New step content renders inside the same card
5. If AI suggestions are needed, they load async (can show skeleton/placeholder tags while loading)
6. On final step submit → transition to processing/results view

### Step Configuration for Control

Adapt the step sequence for your domain. Example for a consultation intake:

```typescript
const consultationSteps: WizardStep[] = [
  {
    id: 'objective',
    question: 'What do you want to accomplish with AI?',
    placeholder: 'Describe your goal...',
    required: true,
  },
  {
    id: 'domain',
    question: 'What industry or process area?',
    suggestions: [], // Populated by AI after step 1
    required: true,
  },
  {
    id: 'constraints',
    question: 'What are your constraints?',
    suggestions: [], // AI-generated from previous answers
    required: false,
  },
  {
    id: 'timeline',
    question: "What's your timeline?",
    suggestions: ['This week', '2-4 weeks', '1-3 months', 'Exploring'],
    required: false,
  },
]
```

---

## Background Effects

### Particle Canvas

A full-screen canvas renders floating particles/stars behind all content:

```jsx
<canvas className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
```

Implementation options (lightweight to full-featured):

- **tsparticles** / `@tsparticles/react` — most popular, configurable
- **Custom canvas** — simple requestAnimationFrame loop drawing small dots with slow drift
- **CSS-only fallback** — radial gradients on body achieve 80% of the effect with zero JS:

```css
body {
  background-color: hsl(225, 64%, 11%);
  background-image:
    radial-gradient(ellipse at 20% 50%, hsla(217, 100%, 61%, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, hsla(175, 80%, 55%, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, hsla(263, 80%, 65%, 0.04) 0%, transparent 50%);
}
```

---

## Key Design Principles

1. **`font-light` everywhere** — headings, body copy, tags. The weight creates elegance.
2. **`--radius: 9999px`** — buttons and badges are pills by default. Tags and cards use `rounded-md` / `rounded-xl` to differentiate.
3. **Bottom-border inputs** — no boxed input fields. Transparent background, single bottom line.
4. **Glassmorphism cards** — `bg-card/50 backdrop-blur-sm` over the particle background.
5. **Animated gradient borders** — rotating conic-gradient on `::before`, masked to border edge only.
6. **Muted helper text** — `text-muted-foreground` at 55% lightness. Placeholders even more faded at `/40` opacity.
7. **Generous whitespace** — `py-20`, `mb-12`, `gap-6`. Let the dark background breathe.
8. **Color through gradients, not fills** — the teal/blue/purple gradient is the accent system. Solid fills are reserved for small elements (dots, badges, tag borders).

---

## File Dependencies

When scaffolding the Control project, install:

```bash
npm create vite@latest control -- --template react-ts
cd control
npm install
npx shadcn@latest init
# Choose: New York style, Slate base, CSS variables: yes

# Install specific shadcn components used
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add tooltip

# Icons
npm install lucide-react

# Font
npm install @fontsource-variable/inter
```

Then in your root CSS, replace shadcn's default tokens with the dark palette defined above.
