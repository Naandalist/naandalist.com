# Naandalist.com

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Naandalist/naandalist.com)
[![Astro](https://img.shields.io/badge/Astro-5.0-FF5D01.svg)](https://astro.build)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Personal website built with Astro, featuring a clean design and optimized for speed.

## Tech Stack

- Astro 5
- Tailwind CSS 3
- MDX with Content Collections
- TypeScript
- Vercel Analytics

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Naandalist/naandalist.com.git
cd naandalist.com
```

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

The site will be available at `http://localhost:4321`



## License

MIT License - see [LICENSE](LICENSE) for details.

## Todo List

### High Priority
- [x] **Image Optimization**: Replace `<img>` tags with Astro's `<Image />` component in `index.astro` and other pages for better performance (LCP).
- [ ] **404 Page**: Create `src/pages/404.astro` to handle "Not Found" errors gracefully.
- [ ] **Accessibility**: Add visible focus states to all interactive elements (links, buttons) in `global.css` or individual components.

### Medium Priority
- [ ] **Refactor Scripts**: Move inline scripts from `Head.astro` to a separate client-side script file (e.g., `src/scripts/main.ts`) for better maintainability.
- [ ] **Code Quality**: Extract hardcoded strings (like "Hi, Naandalist here") to a constants file or content collection.
- [ ] **SEO**: Verify `sitemap-index.xml` generation and ensure `robots.txt` is correctly configured.

### Low Priority
- [ ] **UI Polish**: Add a "Skip to content" link for better keyboard navigation.
- [ ] **PWA**: Add a Web App Manifest and Service Worker for offline support.

