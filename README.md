# Typedesk

A retro RobCo CRT terminal-inspired typing application built with React 19, TypeScript, and Vite. Designed for zero-reflow layout stability and sub-millisecond keystroke engine performance.

🚀 **Live Demo:** [https://shoytanbaba99.github.io/typedesk/](https://shoytanbaba99.github.io/typedesk/)

## Features

- **Monospace Engine:** Pre-broken line matrices for zero-reflow rendering and sub-millisecond keystroke handling.
- **Custom Text Ingestion:** Ingest plain text or JSON string arrays (`["react", "typescript", "vite"]`) with schema validation and input truncation guarding.
- **Multiple Test Modes:** Time-based (15s, 30s, 60s, 120s), Word count (10, 25, 50, 100), and Quote tiers (short, medium, long).
- **Speed Metrics:** Real-time Net WPM, Raw WPM, Accuracy %, and high-precision monotonic timing.
- **Terminal Ergonomics:** Quick restart shortcut (`Tab + Enter`), CRT phosphor theme toggling, and accessibility-first keyboard navigation.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 + Vanilla CSS CRT Scanline Filters
- **Icons:** Lucide React

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Build

```bash
# Typecheck and build production bundle
npm run build

# Preview build locally
npm run preview
```

## License

MIT
