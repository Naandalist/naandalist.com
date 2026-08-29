---
title: "AIA Generative AI Platform"
description: "An internal AI platform for validating marketing content against company policies."
date: "2024-10-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/generative-ai-aia-platform.webp"
techStack: ["Next.js", "Redux Toolkit", "RAG", "Google Gemini"]
category: "Internal AI Web Application"
platforms: ["Web"]
price: "Internal"
keywords: ["AIA Generative AI Platform", "content validation", "marketing compliance", "Next.js", "Redux Toolkit", "RAG", "Gemini"]
lang: "en"
---

AIA Generative AI Platform is an internal application for validating marketing assets before they are shared on public social media. The marketing team can submit image content or PDF documents and review whether the material aligns with company policy standards.

I worked on this platform during my time at AIA as a Senior Engineer / Analyst. The project combined a web-based review workflow with generative AI and retrieval-augmented generation to make policy context available during content analysis.

![AIA Generative AI Platform login screen](@assets/images/generative-ai-aia-platform.webp)

## The Product Problem

Public marketing material must satisfy company policies before publication. An image or PDF can contain many elements that need review, while the applicable standards may be distributed across policy documents.

The platform gives the internal marketing team one place to submit content, apply the relevant rules, and inspect findings before the asset reaches a public channel. It supports human review by organizing the validation result rather than treating a generative model as the final policy authority.

## My Role

My contribution covered the web application flow, state management, and the integration between the content-validation experience and the AI pipeline. I worked with the existing policy-validation requirements and translated them into an interface where users could create a validation request, track its processing status, and review the result.

Because this is an internal platform, its production environment, policy corpus, and source code are not publicly accessible. This case study focuses on the system design and user workflow without exposing internal policy content.

## Content Validation Workflow

The application organizes validation as a reviewable process:

1. **Submit content:** A marketing user provides an image or PDF document for validation.
2. **Retrieve policy context:** The RAG workflow supplies relevant company-policy context for the submitted material.
3. **Analyze with Gemini:** Gemini evaluates the content against the retrieved context.
4. **Structure findings:** The platform presents the rules applied, impact severity, processing status, and validation date.
5. **Support review:** The marketing team can inspect the result before deciding whether the asset is ready for public social media.

This flow keeps the AI output connected to both the submitted asset and the policy context used to evaluate it.

## Validation Interface

The validation dashboard provides visibility across multiple content collections. Each row summarizes the number of rules applied, groups findings by impact severity, reports whether processing is complete or still in progress, and records the validation date.

![AIA Generative AI Platform content-validation dashboard](@assets/images/Screenshot-generative-ai-aia-platform.png)

The interface makes AI analysis easier to review. Instead of returning only a block of generated text, it presents operational signals that help users compare validation results and identify higher-impact findings.

## Architecture

The web application is built with [Next.js](https://nextjs.org/). [Redux Toolkit](https://redux-toolkit.js.org/) manages client-side workflow state across content submission, processing, and result display.

The AI layer uses [retrieval-augmented generation](https://cloud.google.com/use-cases/retrieval-augmented-generation) with [Google Gemini](https://ai.google.dev/gemini-api/docs). RAG provides relevant policy context, while Gemini analyzes the submitted image or PDF against that context and produces findings for the application to present.

### Technology Responsibilities

| Technology | Responsibility |
| --- | --- |
| [Next.js](https://nextjs.org/) | Provides the web application foundation for authentication, content submission, validation history, and result review. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Coordinates client-side state for uploaded content, processing status, filters, and validation results. |
| [Retrieval-augmented generation](https://cloud.google.com/use-cases/retrieval-augmented-generation) | Grounds each validation request with relevant company-policy context before model analysis. |
| [Google Gemini](https://ai.google.dev/gemini-api/docs) | Analyzes image and PDF content against the retrieved context and returns policy-related findings. |

## Engineering Challenge

The central challenge was turning generative AI output into an internal workflow that people could review. A simple pass or fail answer would hide too much context. Marketing users needed to see which rules were applied, the severity of the findings, and whether analysis had completed.

RAG addressed a second concern: policy validation should use company-specific context rather than rely only on a model's general knowledge. The application then transformed that grounded analysis into structured information suitable for operational review.

## Why It Matters

This project demonstrates how I approach generative AI as part of a real product workflow. The value came from combining model capability, policy grounding, state management, and a reviewable interface for the internal team responsible for public content.
