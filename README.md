# Naandalist.com

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Naandalist/naandalist.com)
[![Astro](https://img.shields.io/badge/Astro-5.0-FF5D01.svg)](https://astro.build)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern portfolio and blog website built with [Astro](https://astro.build), featuring a clean design and optimized for speed.

## 🚀 Features

- **⚡ Fast & Optimized** - Built with Astro for optimal performance and SEO
- **🎨 Tailwind CSS** - Modern, responsive design with utility-first CSS
- **📱 Mobile-First** - Fully responsive across all devices
- **🌙 MDX Support** - Enhanced markdown with component support
- **📊 Analytics** - Integrated Vercel Analytics and Speed Insights



## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com)
- **Content**: MDX with Astro Content Collections
- **Icons**: [Font Awesome](https://fontawesome.com)
- **Fonts**: [Inter](https://rsms.me/inter/) via Fontsource
- **Analytics**: Vercel Analytics & Speed Insights
- **Package Manager**: pnpm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Naandalist/naandalist.com.git
   cd naandalist.com
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

   The site will be available at `http://localhost:4321`



## ⚙️ Configuration

### Site Settings

Update site information in `src/consts.ts`:

```typescript
export const SITE: Site = {
  NAME: "Your Name",
  EMAIL: "your@email.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};
```

## 🎨 Customization

- **Colors & Theme**: Modify `tailwind.config.mjs`
- **Global Styles**: Edit `src/styles/global.css`
- **Components**: Customize components in `src/components/`
- **Layout**: Adjust the main layout in `src/layouts/PageLayout.astro`

## 🚀 Deployment

This site is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect Astro and configure the build settings
4. Deploy! 🎉

You can also deploy to other platforms that support static sites:
- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS Amplify

## 📜 License

This project is open source and available under the [MIT License](LICENSE).



