import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const viteEnvPath = require.resolve("vite/dist/client/env.mjs");

export default defineConfig({
  site: "https://naandalist.com",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/privacy") && !page.includes("/terms"),
    }),
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
  legacy: {
    collectionsBackwardsCompat: true,
  },
  vite: {
    plugins: [
      {
        name: "resolve-vite-env",
        enforce: "pre",
        apply: "serve",
        resolveId(id) {
          if (id === "@vite/env") return viteEnvPath;
        },
      },
    ],
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
