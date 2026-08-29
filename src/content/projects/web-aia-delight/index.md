---
title: "AIA Delight Web App"
description: "An internal marketing app for managing the coupon lifecycle."
date: "2023-02-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-aia-delight.webp"
techStack: ["React", "JavaScript", "Create React App"]
category: "Internal Web Application"
platforms: ["Web"]
price: "Internal"
keywords:
  [
    "AIA Delight",
    "internal application",
    "coupon management",
    "React",
    "Create React App",
    "JavaScript",
  ]
lang: "en"
---

AIA Delight is an internal web application used by the marketing team to operate coupon programs. It brings coupon issuance, customer claims, expiration management, and related operational workflows into one interface.

I worked on this application during my time at AIA as a Senior Engineer / Analyst. Unlike a public campaign page, this product supported the people running the program behind the scenes, where clear states and reliable actions mattered more than promotional presentation.

![AIA Delight experience](@assets/images/thumbnail-aia-delight.webp)

## The Operational Problem

Coupon programs continue after a campaign goes live. Marketing teams still need to issue coupons, review claims, track their lifecycle, and handle expiration consistently. Those activities become difficult to coordinate when their status and actions are spread across disconnected processes.

AIA Delight provided a focused operational interface for managing that lifecycle. Its purpose was to help the internal team understand what had happened to a coupon, what action was available next, and whether it remained valid.

## My Role

My contribution focused on the web application and its coupon-management workflows. I implemented and maintained frontend behavior within the existing codebase, translating marketing operations into interfaces that could support repeated day-to-day use.

Because the application was internal, its production environment and source code are not publicly accessible. This case study therefore focuses on the product responsibilities and engineering context rather than confidential business rules or operational data.

## UAT Implementation Evidence

The following screenshot was captured while I was developing and validating the application in the User Acceptance Testing environment. It shows the AIA Delight transaction interface alongside the browser Network panel and API response used to inspect the data integration during implementation.

![AIA Delight UAT transaction screen with API response inspection](@assets/images/Screenshot-aia-delight.png)

> **UAT disclosure:** This screenshot comes exclusively from the UAT environment and uses dummy test data. It does not contain production customer data or personal information.

## Core Workflows

The application supported several connected parts of the coupon lifecycle:

1. **Coupon issuance:** Creating or distributing coupons for eligible marketing activities.
2. **Coupon claims:** Handling the workflow when a coupon was claimed.
3. **Expiration management:** Tracking validity and managing coupons that reached their expiry date.
4. **Lifecycle visibility:** Helping internal users distinguish coupon states and identify the appropriate next action.

Treating these as a connected lifecycle was important. Issuance, claim, and expiration are not isolated screens; each action changes what should be possible afterward.

## Legacy Frontend Architecture

The application was built with [React](https://react.dev/) using a legacy [Create React App](https://create-react-app.dev/) setup. The codebase still used [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) rather than TypeScript.

Working inside that environment required understanding the established component conventions and data flow before changing business-sensitive coupon behavior. Without static type checking, API assumptions and state transitions needed extra care during implementation and review.

### Technology Responsibilities

| Technology                                                            | Responsibility                                                                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [React](https://react.dev/)                                           | Provides the component-based interface for coupon operations and reusable internal workflows.                          |
| [Create React App](https://create-react-app.dev/)                     | Supplies the legacy project structure, development environment, and frontend build pipeline.                           |
| [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | Implements application behavior, coupon state handling, and interaction logic in the existing non-TypeScript codebase. |

## Engineering Challenge

The main challenge was evolving a legacy JavaScript application around stateful business workflows. Coupon operations carry dependencies: an issued coupon can become claimed, a validity window can close, and available actions must follow the current state.

That made regression awareness essential. A seemingly local UI adjustment could affect what an internal user was allowed to do later in the lifecycle. I approached changes incrementally, first tracing the existing behavior and then keeping interface actions aligned with the coupon state represented by the application.

## Why It Matters

Internal applications rarely receive the same visibility as customer-facing products, but they directly shape operational accuracy. This project strengthened my experience working with legacy React systems, modeling stateful business workflows, and building tools for non-engineering teams whose daily work depends on predictable software.
