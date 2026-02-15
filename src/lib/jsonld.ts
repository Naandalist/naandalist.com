/**
 * JSON-LD Schema Generators for SEO
 *
 * This module provides reusable functions to generate structured data (JSON-LD)
 * for different content types. Use these with the JsonLd component.
 *
 * @example
 * ```astro
 * ---
 * import JsonLd from "@components/JsonLd.astro";
 * import { createBlogPostingSchema } from "@lib/jsonld";
 *
 * const schema = createBlogPostingSchema(post);
 * ---
 * <JsonLd schema={schema} />
 * ```
 */
import type { CollectionEntry } from "astro:content";

import { SITE } from "@constants";

const SITE_URL = SITE?.URL ?? "https://naandalist.com";
const getLangPrefix = (lang: "en" | "id") => (lang === "id" ? "/id" : "");
const normalizeContentSlug = (slug: string) =>
  slug.replace(/\/index(?:\.id|id)?\/?$/, "");
const normalizeSoftwarePrice = (price?: string) => {
  if (!price) return "0";

  const normalized = price.trim().toLowerCase();
  if (normalized === "free" || normalized === "gratis") {
    return "0";
  }

  const numericCandidate = normalized
    .replace(/[^0-9.,-]/g, "")
    .replace(",", ".");
  const numericPrice = Number(numericCandidate);

  if (Number.isFinite(numericPrice) && numericPrice >= 0) {
    return numericPrice.toString();
  }

  return undefined;
};
const getProjectImageUrl = (project: CollectionEntry<"projects">) =>
  project.data.imageUrl ? `${SITE_URL}${project.data.imageUrl.src}` : undefined;
const AUTHOR = {
  "@type": "Person" as const,
  name: "Listiananda Apriliawan",
  url: SITE_URL,
};

/**
 * Creates a BlogPosting schema for blog posts
 * @param post - A post collection entry
 * @returns BlogPosting JSON-LD schema
 */
export function createBlogPostingSchema(post: CollectionEntry<"posts">) {
  const cleanSlug = normalizeContentSlug(post.slug);
  const langPrefix = getLangPrefix(post.data.lang);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.data.title,
    description: post.data.description || post.data.subtitle,
    datePublished: post.data.date.toISOString(),
    dateModified: post.data.date.toISOString(),
    author: AUTHOR,
    publisher: AUTHOR,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${langPrefix}/posts/${cleanSlug}/`,
    },
    inLanguage: post.data.lang,
    keywords: post.data.keywords?.join(", ") || post.data.title,
    articleBody: post.body,
  };
}

/**
 * Creates a CreativeWork schema for projects
 * @param project - A project collection entry
 * @returns CreativeWork JSON-LD schema
 */
export function createCreativeWorkSchema(project: CollectionEntry<"projects">) {
  const cleanSlug = normalizeContentSlug(project.slug);
  const langPrefix = getLangPrefix(project.data.lang);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.data.title,
    description: project.data.description,
    datePublished: project.data.date.toISOString(),
    author: AUTHOR,
    url: `${SITE_URL}${langPrefix}/projects/${cleanSlug}/`,
    inLanguage: project.data.lang,
    keywords: project.data.title,
  };
}

/**
 * Creates a SoftwareApplication schema for mobile/web apps
 * Best used for projects with category, platforms, and price fields
 * @param project - A project collection entry
 * @returns SoftwareApplication JSON-LD schema
 */
export function createSoftwareApplicationSchema(
  project: CollectionEntry<"projects">,
) {
  const normalizedPrice = normalizeSoftwarePrice(project.data.price);
  const baseSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.data.title,
    applicationCategory: project.data.category || "EducationalApplication",
    operatingSystem: project.data.platforms?.join(", ") || "Android",
    offers: normalizedPrice
      ? {
          "@type": "Offer",
          price: normalizedPrice,
          priceCurrency: "USD",
        }
      : undefined,
    image: getProjectImageUrl(project),
    publisher: {
      "@type": "Organization",
      name: "Naandalist Labs",
    },
    inLanguage: project.data.lang,
  };

  if (project.data.liveURL) {
    baseSchema.downloadUrl = project.data.liveURL;
    baseSchema.installUrl = project.data.liveURL;
  }

  if (project.data.category) {
    baseSchema.applicationSubCategory = project.data.category;
  }

  // Remove undefined values
  Object.keys(baseSchema).forEach((key) => {
    if (baseSchema[key] === undefined) {
      delete baseSchema[key];
    }
  });

  return baseSchema;
}

/**
 * Creates a NewsMediaOrganization schema for news websites
 * Best used for news portal projects
 * @param project - A project collection entry
 * @returns NewsMediaOrganization JSON-LD schema
 */
export function createNewsMediaOrganizationSchema(
  project: CollectionEntry<"projects">,
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: project.data.title,
    url: project.data.liveURL,
    logo: getProjectImageUrl(project),
    foundingLocation: "Sumatera Selatan, Indonesia",
    developer: AUTHOR,
  };
}

/**
 * Creates a WebSite schema with search capability
 * Best used for projects with search functionality
 * @param project - A project collection entry
 * @returns WebSite JSON-LD schema
 */
export function createWebSiteSchema(project: CollectionEntry<"projects">) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: project.data.title,
    url: project.data.liveURL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${project.data.liveURL}/?s={query}`,
      "query-input": "required name=query",
    },
  };
}
