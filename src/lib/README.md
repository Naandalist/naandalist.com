# Reusable JSON-LD Utilities

This directory contains utilities for generating structured data (JSON-LD) schemas for SEO.

## Usage

### 1. Import the JsonLd Component

```astro
import JsonLd from "@components/JsonLd.astro";
```

### 2. Import Schema Generator Functions

```astro
import {
  createBlogPostingSchema,
  createCreativeWorkSchema,
  createSoftwareApplicationSchema,
  createNewsMediaOrganizationSchema,
  createWebSiteSchema,
} from "@lib/jsonld";
```

### 3. Generate and Render Schema

#### For Blog Posts

```astro
---
const post = Astro.props; // CollectionEntry<"posts">
const schema = createBlogPostingSchema(post);
---

<PageLayout title={post.data.title} description={post.data.description}>
  <JsonLd schema={schema} />
  <!-- rest of your content -->
</PageLayout>
```

#### For Projects (Single Schema)

```astro
---
const project = Astro.props; // CollectionEntry<"projects">
const schema = createCreativeWorkSchema(project);
---

<PageLayout title={project.data.title} description={project.data.description}>
  <JsonLd schema={schema} />
  <!-- rest of your content -->
</PageLayout>
```

#### For Projects (Multiple Schemas)

```astro
---
const project = Astro.props;
const schemas: Record<string, any>[] = [
  createCreativeWorkSchema(project),
  createSoftwareApplicationSchema(project),
];
---

<PageLayout title={project.data.title} description={project.data.description}>
  <JsonLd schema={schemas} />
  <!-- rest of your content -->
</PageLayout>
```

## Available Schema Generators

### `createBlogPostingSchema(post)`

Creates a `BlogPosting` schema for blog posts.

**Best for:** Blog articles, tutorials, guides

**Fields used:**

- title
- description/subtitle
- date
- keywords
- body

### `createCreativeWorkSchema(project)`

Creates a `CreativeWork` schema for projects.

**Best for:** General projects, portfolios

**Fields used:**

- title
- description
- date

### `createSoftwareApplicationSchema(project)`

Creates a `SoftwareApplication` schema for software projects.

**Best for:** Mobile apps, web apps, desktop applications

**Fields used:**

- title
- description
- category
- platforms
- price
- demoURL
- imageUrl

### `createNewsMediaOrganizationSchema(project)`

Creates a `NewsMediaOrganization` schema for news websites.

**Best for:** News portals, media organizations

**Fields used:**

- title
- demoURL
- imageUrl

### `createWebSiteSchema(project)`

Creates a `WebSite` schema with search capability.

**Best for:** Websites with search functionality

**Fields used:**

- title
- demoURL

## Content Schema Requirements

Make sure your content collections have the required fields. See `/src/content/config.ts` for the schema definitions.

### Posts Schema

```typescript
{
  title: string;
  subtitle: string;
  description?: string;
  date: Date;
  draft?: boolean;
  keywords?: string[];
}
```

### Projects Schema

```typescript
{
  title: string;
  description: string;
  date: Date;
  lastUpdated?: Date;
  draft?: boolean;
  demoURL?: string;
  repoURL?: string;
  imageUrl?: string;
  techStack?: string[];
  category?: string;
  platforms?: string[];
  price?: string;
  keywords?: string[];
}
```

## Configuration

Update the constants in `/src/lib/jsonld.ts` if you need to change:

- `SITE_URL`: Your website URL
- `AUTHOR`: Author information

```typescript
const SITE_URL = "https://naandalist.com";
const AUTHOR = {
  "@type": "Person" as const,
  name: "Listiananda Apriliawan",
  url: SITE_URL,
};
```
