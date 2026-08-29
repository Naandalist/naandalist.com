---
title: "Ringkaskata.com"
description: "An independent platform for publishing positive Indonesian stories."
date: "2026-02-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-ringkaskata.webp"
liveURL: "https://ringkaskata.com/"
repoURL: ""
techStack:
  [
    "Next.js",
    "TypeScript",
    "Neon PostgreSQL",
    "Drizzle ORM",
    "Resend",
    "TipTap",
    "Cloudinary",
  ]
category: "Media & Publishing"
platforms: ["Web"]
price: "Free"
keywords:
  [
    "Ringkaskata",
    "Indonesian publishing",
    "Next.js",
    "editorial platform",
    "SEO",
    "independent media",
  ]
lang: "en"
---

Ringkaskata is an independent Indonesian publishing platform I co-founded with a journalism graduate. I built the product end-to-end so freelance writers could publish work that often struggled to pass verification on larger platforms. Our editorial direction is simple: make room for useful, positive, and verified stories amid the noise of online misinformation.

![Ringkaskata website screenshot](@assets/images/thumbnail-ringkaskata.webp)

## My Role

As the technical co-founder and sole full-stack developer, I owned the architecture, implementation, deployment, and technical trade-offs from the public site to the internal publishing tools. My co-founder shaped the editorial direction, while four writing contributors create and submit articles.

## Product and Editorial Workflow

I built a custom admin dashboard rather than adopting a generic CMS. Contributors prepare articles as drafts, then authorized admins review and publish them. The dashboard supports three access levels: guest, admin, and superadmin.

For authoring, I integrated the TipTap rich-text editor. Writers can source thumbnail images through the Unsplash API or upload their own assets to Cloudinary. This keeps the publishing flow focused while giving the editorial team enough control over content quality and presentation.

## Architecture

[Ringkaskata](https://ringkaskata.com/) runs as a full-stack [Next.js](https://nextjs.org/) application written in [TypeScript](https://www.typescriptlang.org/). [Neon](https://neon.com/) provides the serverless PostgreSQL database, with [Drizzle ORM](https://orm.drizzle.team/) as the type-safe schema and query layer. [Resend](https://resend.com/) handles passwordless admin access through magic links. The application is deployed on [Vercel](https://vercel.com/), with [Cloudflare](https://www.cloudflare.com/) managing DNS.

I added sitemap generation, page metadata, and [Google Search Console](https://search.google.com/search-console/about) integration to support discoverability. [Ahrefs](https://ahrefs.com/) complements Search Console for SEO monitoring, while [Umami Cloud](https://umami.is/) provides privacy-friendly visitor analytics and visibility into audience activity.

### Stack Responsibilities

| Technology                                                                                              | Responsibility                                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Next.js](https://nextjs.org/)                                                                          | Runs the public publication and custom admin dashboard as one full-stack application. |
| [TypeScript](https://www.typescriptlang.org/)                                                           | Adds type safety across the frontend, server logic, and shared data contracts.        |
| [Neon PostgreSQL](https://neon.com/)                                                                    | Stores application and editorial data in a managed serverless PostgreSQL database.    |
| [Drizzle ORM](https://orm.drizzle.team/)                                                                | Defines the database schema and provides type-safe queries between Next.js and Neon.  |
| [Resend](https://resend.com/)                                                                           | Delivers passwordless magic links for admin authentication.                           |
| [TipTap](https://tiptap.dev/)                                                                           | Provides the rich-text authoring experience for article drafts.                       |
| [Unsplash API](https://unsplash.com/developers)                                                         | Lets contributors discover suitable article thumbnails from the dashboard.            |
| [Cloudinary](https://cloudinary.com/)                                                                   | Stores and delivers images uploaded manually by the editorial team.                   |
| [Vercel](https://vercel.com/)                                                                           | Hosts and deploys the Next.js application through a framework-native workflow.        |
| [Cloudflare](https://www.cloudflare.com/)                                                               | Manages the domain and DNS layer.                                                     |
| [Google Search Console](https://search.google.com/search-console/about) + [Ahrefs](https://ahrefs.com/) | Monitor indexing, discoverability, keywords, and search performance.                  |
| [Umami Cloud](https://umami.is/)                                                                        | Tracks privacy-friendly visitor and content engagement metrics.                       |

## Challenge: Hosting Resilience

An early availability incident exposed friction in the Cloudflare Workers ecosystem for this Next.js application. I evaluated the operational trade-offs and migrated the deployment to Vercel. The move gave the project a more resilient, Next.js-native hosting setup while retaining Cloudflare for DNS management.

## Discovery and Impact

The SEO foundation is already producing results: published articles have begun appearing in Google Search. I monitor indexing and search performance through Google Search Console and Ahrefs, then use Umami to understand visitor activity and which content earns attention.

## Engineering Workflow

I use Codex as a thinking partner when evaluating technical trade-offs. It accelerates research and brainstorming, while architecture decisions, implementation, and product ownership remain mine.

## Why It Matters

Ringkaskata turns a publication bottleneck into an owned platform: writers have a place to publish, editors have a focused workflow, and readers gain a calmer source of useful Indonesian stories.
