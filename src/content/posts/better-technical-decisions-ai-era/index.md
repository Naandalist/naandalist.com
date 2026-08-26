---
title: "Better Engineering Decisions in the AI Era"
subtitle: "Better technical decisions matter more than generating more code."
description: "Why engineering judgment, project constraints, verification, and maintainability matter more than coding speed or chasing new technology in the AI era."
date: "2026-08-26"
draft: false
featured: false
lang: "en"
keywords:
  - engineering judgment
  - technical decisions
  - AI coding
  - software architecture
  - technology tradeoffs
---

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1787754947/naandalist.com/primordial_golem_by_oasidd_dmp76wv-pre_anfm32.jpg" alt="Better Engineering Decisions in the AI Era" />
</div>

AI can generate code faster than ever. That does not mean we can finish the right product faster.

The bottleneck has moved.

Writing code is becoming cheaper. Making sure we are writing the right code, with the right technology, for the right constraints remains difficult. In the AI era, the most valuable engineering skill is not typing faster. It is making better technical decisions.

## Every Decision Depends on the Situation

There is no universally correct technology choice.

A project with a limited budget needs different decisions from a project with abundant resources. A small team working against a deadline has different constraints from a large team building infrastructure for millions of users.

The goal is not to use the most sophisticated technology. The goal is to finish the project on schedule, stay within budget, and fulfill the requirements.

That may sound obvious. Yet engineers often lose sight of it when a new framework becomes popular.

## FOMO Is Not a Technical Requirement

When people started talking about Lynx, I understood the excitement. New frameworks can introduce useful ideas and push the ecosystem forward. But I still chose React Native for new projects.

React Native is already familiar to me. I understand its strengths, limitations, tooling, and failure modes. Its ecosystem is mature enough for the projects I need to deliver. Replacing that experience with a new framework would introduce risks that the project did not require.

Being an early adopter is not automatically wrong. It is a tradeoff. Early adopters gain access to new capabilities, but they also accept less mature documentation, smaller ecosystems, unstable APIs, unknown production behavior, and harder maintenance.

If the project benefits enough from those capabilities, that risk may be worth taking. If not, adopting new technology only because everyone is discussing it is not innovation. It is FOMO disguised as architecture.

## Mastery of Mature Technology Still Matters

This mindset also makes me respect people who continue building applications with PHP and Laravel.

Some engineers treat older or familiar technology as evidence that a team has stopped learning. I see it differently. If a team has mastered Laravel, can deliver reliably, and can maintain the result for years, that is a valuable engineering advantage.

A proven stack in experienced hands can be a better choice than a trendy stack in inexperienced hands.

Technology does not need to look impressive. It needs to solve the problem. Deep knowledge of a mature tool often reduces delivery time, operational surprises, and maintenance costs. Those outcomes matter more than whether the stack looks modern in a social media post.

## AI Makes Rewrites Faster, Not Automatically Safer

Bun's rewrite from Zig to Rust offers a useful example. AI helped make a rewrite possible at a speed that would have been unrealistic through a traditional process. That achievement is impressive.

But code generation was only one part of the work.

The Bun team still needed a clear porting strategy, trial runs, a large language-independent test suite, adversarial reviews, continuous verification, and manual inspection. The generated code did not become trustworthy simply because it compiled or appeared quickly.

This is the important tradeoff. AI can reduce the cost of producing code, including enormous rewrites. It does not remove the cost of proving that the new system behaves correctly. It also does not answer whether the team can operate and maintain that system over the long term.

The faster we generate code, the more important verification becomes.

## The Engineer's Role Is Moving Upstream

AI changes what engineering leverage looks like.

When implementation becomes faster, more value moves toward framing the problem, understanding constraints, selecting tradeoffs, defining acceptance criteria, and reviewing outcomes. These responsibilities are not secondary to coding. They determine whether the code should exist in the first place.

Before choosing a technology, I now return to three questions:

1. Does it fulfill the project requirements?
2. Can the team deliver it within the available budget and schedule?
3. Can the team test, operate, and maintain it over the long term?

These questions are simple, but they expose weak decisions quickly.

A technology may perform well in benchmarks but fail the second question because the team needs months to learn it. Another may accelerate the first release but fail the third because its ecosystem is unstable. A familiar framework may not be exciting, but it can still be the best answer across all three.

## Better Decisions Beat More Code

Coding speed still matters. AI is an extraordinary tool for increasing it. But speed has value only when it moves the project in the right direction.

Engineering is not a competition to use the newest framework or generate the most code. It is the practice of delivering a system that fulfills real requirements under real constraints.

Sometimes the right decision is React Native instead of a new framework. Sometimes it is Laravel instead of a more fashionable backend. Sometimes it is a massive AI-assisted rewrite, supported by enough testing and review to justify the risk.

Context decides.

The strongest engineer in the AI era will not be the person who produces code fastest. It will be the person who knows what should be built, why it should be built that way, and which tradeoffs the project can afford.

## Reference

- [Rewriting Bun in Rust](https://bun.com/blog/bun-in-rust)
