---
title: "Partial API Responses for Better UX"
subtitle: "UX First, Purity Second"
description: "A practical pattern for returning partial API responses so users see real data quickly while slower fields are filled in later using track IDs and follow-up calls, reducing perceived loading time and drop-off."
date: "2025-11-16"
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

## When Perfect Data Kills UX

Our product had a very simple but painful problem: the product page was too slow.

On paper, the backend was _“working”_. It took about five seconds for the server to process a request and send the full response back to the client. In reality, analytics told a different story: many users closed the app after two or three seconds of loading. A five-second wait might be acceptable for a file upload, but for a normal screen it is a terrible UX.

After digging into the server side, we found a clear bottleneck. Most fields were fast to fetch: name, description, seller, address, and so on. The one thing that consistently slowed everything down was the price.

The product API had been designed as an all-or-nothing payload, so every request waited for the slowest dependency. The price field was holding the entire response hostage.

## From Perfect Payloads to Honest Incompleteness

At some point the question became very direct: do users really need every single field to appear at the same time?

Analytics already showed that if nothing appears within a couple of seconds, users simply give up. What they actually need first is the “identity” of the product: name, image, and basic info. The exact price matters, but it does not have to be the first thing that shows up on the screen.

This led us to a different mindset. Instead of forcing the API to always return a “perfect” payload, we allowed it to return an honest, incomplete one. That means sending all the data that is ready, and explicitly marking the parts that are still pending. On the client side, the UI renders whatever is available immediately, while keeping a loading state only for the missing pieces.

The result is that users see a real product quickly, instead of staring at a full-screen spinner that hides the fact that 90% of the data was already there.

## How It Works

In practice, the pattern is simple.

When the client calls _`/product`_, the backend tries to fetch all the basic fields and also generates a _`track_id`_ that represents the ongoing price lookup.

If everything is ready, the response is just a normal, complete JSON object. If the price is still being processed or the downstream price service is slow, the backend **does not block** the entire response. It returns something like this:

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

The meaning is clear:

- The product exists and all core fields are ready.
- The track_id identifies this price calculation on the backend.
- price is not available yet.
- priceComplete: false tells the client that the story is not over.

On the UI side, the client:

- Renders the product immediately using the fields that are already there.
- Shows a skeleton or “loading…” state in the price area when priceComplete is false.

Instead of calling /product again, the client now uses a dedicated endpoint to complete the missing piece. After a short delay, or according to some retry policy, it calls something like:

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

The backend looks up the price status using track_id (and optionally productId). The response can still be incomplete:

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": false
}
```

In that case, the client keeps the loading state and retries getPrice after another small delay. When the price is finally ready, the endpoint responds with:

```json
{
  "track_id": "track-999",
  "price": 49.99,
  "priceComplete": true
}
```

At this point, the UI replaces the skeleton with the real price and stops retrying. The important detail is that:

| Endpoint    | Responsibility                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| `/product`  | Fast, partial data: all "identity" fields + `track_id` + `priceComplete` flag |
| `/getPrice` | Turning "pending price" into "real price" using `track_id`                    |

Every response is a valid JSON object, and the client always knows exactly which part of the data is still in progress.

### When the Server Gives Up on Price

There is one more important case: sometimes the backend decides to stop trying.

In rare situations, the price service might keep failing or time out repeatedly. At that point, the backend can decide to “give up” and mark the price lookup as finished, even though no valid price was found. The response from getPrice then looks like this:

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": true
}
```

Semantically, this means:

- The price pipeline is finished.
- There is no usable price for this product.
- Further retries will not change the result.

On the UI side, this state should be treated differently from the “still loading” case. If priceComplete is true and price is still null, we do not keep showing a skeleton and we do not keep retrying.

Instead, the simplest and safest behavior in our case is to filter these products out of the list and not show them at all, because we cannot offer a meaningful price to the user.

- This extra state makes the contract honest in both directions:
- _"Still processing, please wait"_ (priceComplete: false).
- _"Processing is over, there is no price"_ (priceComplete: true with price: null).

### Flow Diagram

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1763224832/naandalist.com/Untitled_diagram-2025-11-15-163928_ym4pao.svg" alt="Partial Response Flow Diagram" />
  <p style="font-size: 0.875rem;"><em>Flow diagram showing the partial response pattern</em></p>
</div>

### Conclusion: UX First, Purity Second

Partial responses are not a fancy protocol or a new framework feature. They are a small shift in how we think about API responses: instead of pretending that data is either “complete” or “not ready at all,” we admit that some fields can arrive later.

By letting the server return what is ready and clearly marking what is still pending, we reduced the perceived loading time without touching low-level networking tricks or streaming.

The JSON shape became slightly less “pure,” but the UX became much better. In the end, that trade is what kept this pattern running safely in production for years.
