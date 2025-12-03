import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://naandalist.com",
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  redirects: {
    "/posts/09-git-commit-message-convention/":
      "/posts/git-commit-message-convention",
    "/blog/09-git-commit-message-convention":
      "/posts/git-commit-message-convention",
  },
  build: {
    inlineStylesheets: "always",
  },
  // Disable prefetch to eliminate critical request chain
  // Pages will still load quickly due to modern browser caching
  prefetch: false,
  vite: {
    build: {
      cssCodeSplit: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: undefined,
          chunkFileNames: "_astro/[name].[hash].js",
          assetFileNames: "_astro/[name].[hash][extname]",
        },
      },
    },
  },
});
