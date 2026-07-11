# 🎨 UI/UX Guidelines — AI Musical Therapy Platform

> **Version**: 0.1.0 | **Last Updated**: July 2026

---

## 1. Color Palette

### Dark Theme (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0A0E1A` | Main background |
| `--bg-secondary` | `#111827` | Cards, panels |
| `--bg-tertiary` | `#1F2937` | Elevated surfaces |
| `--text-primary` | `#F9FAFB` | Primary text |
| `--text-secondary` | `#9CA3AF` | Secondary text |
| `--accent-primary` | `#8B5CF6` | Primary accent (purple) |
| `--accent-secondary` | `#06B6D4` | Secondary accent (cyan) |
| `--accent-gradient` | `linear-gradient(135deg, #8B5CF6, #06B6D4)` | Gradient accent |
| `--success` | `#10B981` | Success states |
| `--warning` | `#F59E0B` | Warning states |
| `--error` | `#EF4444` | Error states |
| `--border` | `#374151` | Borders, dividers |

### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#F9FAFB` | Cards, panels |
| `--bg-tertiary` | `#F3F4F6` | Elevated surfaces |
| `--text-primary` | `#111827` | Primary text |
| `--text-secondary` | `#6B7280` | Secondary text |
| `--accent-primary` | `#7C3AED` | Primary accent |

### Emotion Colors
| Emotion | Color | Hex |
|---------|-------|-----|
| Happy | Gold | `#F59E0B` |
| Sad | Blue | `#3B82F6` |
| Angry | Red | `#EF4444` |
| Surprised | Orange | `#F97316` |
| Fear | Purple | `#A855F7` |
| Disgust | Green | `#22C55E` |
| Neutral | Gray | `#9CA3AF` |

---

## 2. Typography

| Token | Font | Weight | Size | Line Height |
|-------|------|--------|------|-------------|
| `--font-family` | 'Inter', sans-serif | — | — | — |
| `--heading-1` | Inter | 700 | 36px | 1.2 |
| `--heading-2` | Inter | 600 | 28px | 1.3 |
| `--heading-3` | Inter | 600 | 22px | 1.3 |
| `--body-large` | Inter | 400 | 18px | 1.6 |
| `--body` | Inter | 400 | 16px | 1.5 |
| `--body-small` | Inter | 400 | 14px | 1.5 |
| `--caption` | Inter | 500 | 12px | 1.4 |
| `--mono` | 'JetBrains Mono', monospace | 400 | 14px | 1.6 |

---

## 3. Spacing & Grid

**Spacing Scale** (base 4px): `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`

**Grid**: 12-column grid, 24px gutter, max-width 1280px, responsive breakpoints:
| Breakpoint | Width | Columns |
|-----------|-------|---------|
| Mobile | <640px | 4 |
| Tablet | 640–1024px | 8 |
| Desktop | 1024–1280px | 12 |
| Wide | >1280px | 12 |

---

## 4. Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade in | 200ms | ease-out | Page transitions, modals |
| Slide up | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Cards, panels |
| Scale | 150ms | ease-in-out | Buttons hover, active |
| Pulse | 2000ms | ease-in-out (infinite) | Loading, live indicators |
| Skeleton | 1500ms | linear (infinite) | Content loading |
| Spring | 500ms | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Success/celebration |

**Reduced Motion**: Respect `prefers-reduced-motion` — disable non-essential animations.

---

## 5. Responsive Rules

- **Mobile-first** design approach
- Touch targets minimum **44×44px**
- Font sizes scale down proportionally on mobile
- Sidebar collapses to hamburger menu on mobile
- Cards stack vertically below tablet breakpoint
- Images use `object-fit: cover` with aspect ratios

---

## 6. Accessibility (WCAG 2.1 AA)

- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text
- All images have `alt` text; decorative images use `alt=""`
- Focus indicators visible on all interactive elements
- ARIA labels on all buttons, inputs, and interactive elements
- Skip navigation link at page top
- Keyboard navigable: Tab, Shift+Tab, Enter, Escape, Arrow keys
- Screen reader tested with NVDA and VoiceOver
- Form inputs have visible labels (not placeholder-only)

---

## 7. Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors, typography, spacing, shadows, radii, transitions */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
  --shadow-glow: 0 0 20px rgba(139,92,246,0.3);
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
  --z-dropdown: 1000;
  --z-modal: 1100;
  --z-toast: 1200;
}
```

---

## 8. Component Library

**Core Components**: Button (primary/secondary/ghost/danger), Input, TextArea, Select, Checkbox, Radio, Toggle, Card, Modal, Drawer, Toast, Tooltip, Badge, Avatar, Skeleton, Spinner, Progress Bar, Tabs, Accordion, Breadcrumb, Pagination.

**Feature Components**: EmotionDetector, EmotionResultCard, EmotionChart, MusicPlayer, TrackCard, PlaylistView, ChatBubble, ChatInput, JournalEditor, StatsCard, TimelineChart.

---

## 9. Glassmorphism & Modern Effects

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
}

.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

> **All UI implementations must follow these guidelines. Design tokens are the single source of visual truth.**
