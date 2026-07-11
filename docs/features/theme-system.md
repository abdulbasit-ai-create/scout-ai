# Theme System

## Implementation

Scout AI uses a CSS custom property-based dark/light theme system with localStorage persistence and flash-of-unstyled-content (FOUC) prevention.

### Stack

| Layer | Technology |
|---|---|
| Color definitions | CSS custom properties in `oklch()` color space |
| Theme toggle | `.dark` class on `<html>` element |
| Persistence | localStorage key `scout:theme` |
| Flash prevention | Inline `<script>` in `<head>` (runs before React hydration) |
| Print override | `@media print` in `globals.css` |

### CSS Variables

Defined in `globals.css`:

```css
:root {
  --background: oklch(1 0 0);        /* white */
  --foreground: oklch(0.145 0 0);    /* near-black */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  /* ... 30+ variables ... */
}

.dark {
  --background: oklch(0.145 0 0);     /* near-black */
  --foreground: oklch(0.985 0 0);     /* off-white */
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  /* ... 30+ variables ... */
}
```

Shadcn/ui theme variables are declared with `@theme inline` for Tailwind v4 integration, while the actual values use `oklch()` for modern color interpolation.

### Flash Prevention (FOUC)

An inline script in `layout.tsx` runs synchronously in `<head>` before any rendering:

```html
<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{
      __html: `(function(){
        try {
          var t = localStorage.getItem("scout:theme");
          if (t === "light" || t === "dark") {
            document.documentElement.classList.add(t);
          } else if (window.matchMedia("(prefers-color-scheme:light)").matches) {
            document.documentElement.classList.add("light");
          } else {
            document.documentElement.classList.add("dark");
          }
        } catch(e) {
          document.documentElement.classList.add("dark");
        }
      })()`
    }} />
  </head>
```

The `suppressHydrationWarning` on `<html>` prevents React warnings about the mismatch between server-rendered (no class) and client-rendered (class applied by script).

### ThemeToggle Component

A client component (`"use client"`) in `components/layout/theme-toggle.tsx`:

```typescript
function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem("scout:theme")
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light" : "dark"
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    localStorage.setItem("scout:theme", theme)
  }, [theme])

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <button onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  )
}
```

The `useState` initializer runs once and reads the already-set class from the inline script (no FOUC possible).

### Component Integration

Components use theme-agnostic CSS variable classes so they adapt automatically:

```tsx
// All components use these Tailwind classes:
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Subtitle</p>
  <div className="border-border">
```

The theme toggle is rendered inside `Header` (a server component) — the `Header` wraps `<ThemeToggle />` as a client component boundary at the leaf.

## Print Override

The `@media print` section in `globals.css` forces all content to white background with dark text, hides interactive elements (buttons, toolbar), and prevents page breaks inside sections:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
  }
  header { display: none !important; }
  button, [role="toolbar"] { display: none !important; }
  section { break-inside: avoid; }
  @page { margin: 1.5cm; }
}
```

## Touch Targets

For mobile users, interactive elements get a minimum 44px height:

```css
@media (pointer: coarse) {
  button, a {
    min-height: 44px;
  }
}
```

## Theme Flow Diagram

```
Page load
  │
  ├── Inline <script> in <head>:
  │     ├── localStorage.getItem("scout:theme")
  │     │     ├── "dark" → html.classList.add("dark")
  │     │     ├── "light" → html.classList.add("light")
  │     │     └── null → check prefers-color-scheme
  │     │                 ├── light → add "light"
  │     │                 └── dark → add "dark"
  │     │
  │     └── CSS variables apply (no flash)
  │
  ├── React hydrates:
  │     └── ThemeToggle reads classList → sets initial state
  │
  └── User clicks toggle:
        ├── setTheme("light")
        ├── useEffect fires:
        │     ├── html.classList.remove("dark")
        │     └── localStorage.setItem("scout:theme", "light")
        └── Icon updates: Moon → Sun
```

## Implementation Files

| File | Role |
|---|---|
| `app/globals.css` | CSS variables (oklch), .dark overrides, print styles, touch targets |
| `app/layout.tsx` | Inline flash-prevention script |
| `components/layout/theme-toggle.tsx` | Client toggle component |
| `components/layout/header.tsx` | Server component that renders ThemeToggle |
