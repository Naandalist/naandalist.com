---
title: "Partial API Responses for Better UX"
subtitle: "UX First, Purity Second"
description: "A field-tested API contract for shipping core product data fast while slower fields complete asynchronously without blocking the full screen."
date: "2025-11-16"
featured: true
lang: "en"
keywords:
  - API design
  - UX optimization
  - partial responses
  - progressive loading
  - backend performance
  - React Native
  - mobile app optimization
  - loading states
  - user experience
  - API patterns
---

![Neon Skies and Chrome Dreams](https://res.cloudinary.com/naandalistcloud/image/upload/v1763224844/naandalist.com/neon_skies_and_chrome_dreams_by_inkimagine_dk5niy4-pre_va6ndy.jpg)

I am writing as a **5+ YOE engineer**.

## When "Complete Data" Became a UX Bug

In one production flow, our product page API returned a fully assembled payload in around five seconds. Technically correct, but behaviorally wrong. Session analytics showed a large drop-off after two to three seconds, so users were abandoning before they saw any meaningful content.

After profiling the request path, we found an obvious asymmetry: product identity fields were fast, while pricing depended on a slower downstream pipeline. Because the endpoint was all-or-nothing, the slowest field delayed the entire response. We were optimizing payload purity while hurting user trust and task completion.

## The Contract We Shipped Instead

We changed the contract from "everything now" to "everything ready now, pending explicitly later." The primary endpoint returns core data immediately plus a tracking token and completion flag for slow fields.

```json
{
  "id": "123",
  "track_id": "track-999",
  "name": "Running Shoes",
  "description": "Lightweight running shoes for daily training.",
  "seller": "Sport Store",
  "address": "Jl. Example 123",
  "price": null,
  "priceComplete": false
}
```

This made the response semantically honest: the product exists, most fields are ready, and pricing is still in progress.

## Completion Endpoint and UI Behavior

Instead of re-requesting `/product`, the client calls a dedicated completion endpoint with `track_id`.

```txt
POST /getPrice
Content-Type: application/json
```

```json
{
  "track_id": "track-999",
  "productId": "123"
}
```

If price computation is still running, the endpoint returns `priceComplete: false`; when done, it returns final price and `priceComplete: true`. The UI renders identity fields immediately, keeps a scoped loading state only for price, and stops retrying once the completion flag is terminal.

## Terminal Null Is Not the Same as Loading

A critical edge case is terminal failure where computation ends without a usable price.

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": true
}
```

This state must not be treated as "still loading." In our implementation, we stopped retries and applied a deterministic fallback (for example, hide item in price-sensitive listings). Making this explicit prevented infinite loading loops and inconsistent UI behavior across devices.

### Flow Diagram

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1763224832/naandalist.com/Untitled_diagram-2025-11-15-163928_ym4pao.svg" alt="Partial Response Flow Diagram" />
  <p style="font-size: 0.875rem;"><em>Flow diagram showing the partial response pattern</em></p>
</div>

## Risks and Tradeoffs

Partial responses improve perceived performance, but they increase contract complexity because backend and client must agree on pending, complete, and terminal-failure states with strict semantics. They also add operational concerns such as retry policy tuning, idempotency expectations, and stale-state handling when users navigate quickly between screens or resume apps after backgrounding.

## Lessons Learned

The biggest gain came from modeling state transitions explicitly rather than chasing smaller infrastructure optimizations first. Once we defined response states as part of the API contract, UI behavior became predictable, observability became easier, and product discussions shifted from "why is loading slow" to "which state is user seeing and why."

## Field Tips

Start with one slow field that is business-important but not required for first paint, then split that field into a completion workflow with a clear tracking token and terminal state definitions. Instrument each state transition on both backend and client, and review failure paths early, because most UX regressions in this pattern come from ambiguous terminal behavior, not from the happy path.

## Authoritative References

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [MDN: 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202)
- [Atlassian: Designing APIs for asynchronous operations](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#asynchronous-operations)
- [Google: Material loading and progress indicators](https://m3.material.io/components/progress-indicators/overview)

## Conclusion

Partial responses are not a framework trick; they are a contract design choice. Returning ready data early while modeling pending work explicitly gave us faster perceived UX without pretending slow dependencies did not exist. The payload became less "perfect," but the user journey became measurably better and more reliable in production.
