---
title: "Git Commit Message Guide (Conventional Commits)"
subtitle: "Discover how proper commit messages lead to a cleaner codebase"
description: "How to use a simple Conventional Commits standard for Git commit messages—types, scope, examples, and best practices to improve reviews and debugging."
date: "Jun 29 2025"
keywords:
  - Git commit messages
  - conventional commits
  - commit standards
  - version control
  - code documentation
  - development workflow
  - Git best practices
  - team collaboration
  - code review
  - commit conventions
---

## Git Commit Messages That Actually Help

A commit message is not a throwaway note. It is a contract with your future self and your teammates: what changed, where it changed, and why it matters. When commit history is readable, code reviews move faster, debugging becomes cheaper, and releases are easier to reason about.

![Git Commit](https://res.cloudinary.com/naandalistcloud/image/upload/v1766840794/naandalist.com/0_h4BR91VxYGy_lSZi_el4qb6-gitcommit_ojg2ag.webp "Illustration of Git commits")

## Why Commit Standards Are Worth It

You can “just commit and move on,” but you will pay for it later. Most teams feel the pain when they need to trace regressions, audit changes, or onboard a new engineer who must understand the codebase quickly.

A consistent commit standard helps you:

- Scan `git log` and understand intent without opening files.
- Reduce review time because context is obvious before reading diffs.
- Investigate bugs faster by locating the most likely introduction point.
- Enable automation for changelogs and release notes with less manual work.

If your team ships frequently, this is not a cosmetic preference. It is operational hygiene.

## The Conventional Commits Format

Use a predictable pattern that is easy to scan:

```
<type>(<scope>): <short summary>
```

- type: what kind of change this is
- scope (optional but recommended): the part of the codebase affected
- short summary: what you did, written in imperative mood

If you want the official reference, follow the [Conventional Commits specification](https://www.conventionalcommits.org/).

## Types You Should Use (and When)

Choose one type per commit. If you need multiple types, the commit is probably too large and should be split by intent.

| Type | Use it when you... |
| --- | --- |
| feat | add a new feature or meaningful enhancement |
| fix | resolve a bug or regression |
| docs | change documentation only (README, guides, comments) |
| style | apply formatting changes without behavior changes |
| refactor | restructure code without changing external behavior |
| test | add or modify tests |
| chore | perform maintenance work (deps, tooling, small config) |
| build | change build system or external dependency setup |
| ci | change CI/CD pipeline configuration |
| perf | improve performance in a measurable or clearly justified way |

## Scope: Small Detail, Big Payoff

Scope answers a simple question: where did this change happen? It makes commit history searchable and reduces ambiguity.

Common scope patterns include:
- auth, checkout, payments, api, ui, infra, docs

Examples:
- feat(auth): Add refresh token rotation
- fix(checkout): Prevent double submit on pay button
- refactor(api): Consolidate retry logic

## Short Summary: Write It Like a Command

Good summaries read like clear instructions. Use imperative verbs:

- Add, Fix, Update, Remove, Refactor, Improve, Simplify, Prevent

Avoid vague summaries such as “fix bug” or “update stuff.” They provide zero value when you revisit history.

Guidelines that keep it readable:
- Use imperative mood (Add, Fix, Improve), not past tense (Added, Fixed).
- Keep it concise (aim for 50–70 characters).
- Avoid bundling unrelated changes in one commit.

Good ✅ :
- Add avatar upload
- Fix form submission error
- Improve image preload strategy

Bad ❌:
- Added avatar upload
- Fix bug
- Some changes

## When You Need More Context: Add a Body

If the “why” is not obvious, write a body. This is where you record intent, trade-offs, and constraints. It is especially valuable when the fix is subtle or the decision is controversial.

A simple structure works well:

```
feat(auth): Add refresh token rotation

Why:
- Reduce forced logouts on mobile
- Limit token replay risk

How:
- Rotate on refresh
- Revoke previous token id in storage

Notes:
- Requires API v2 endpoint /auth/refresh
```

If your workflow requires traceability, add references to tickets or issues consistently:

- Refs: PAY-214

## Breaking Changes

If a commit breaks compatibility, do not hide it. State it clearly and include what downstream users must do to migrate.

This is not optional. Hidden breaking changes are one of the fastest ways to destroy trust in a repository.

Example:

```
feat(api): Rename /v1/orders endpoint

BREAKING CHANGE: Clients must migrate from /v1/orders to /v2/orders.
```

## Copy-Paste Examples

- feat(user-profile): Add avatar upload
- fix(login): Show correct error for invalid password
- docs(readme): Add local setup steps for iOS
- style(ui): Format files to satisfy lint rules
- refactor(api): Simplify pagination query building
- test(checkout): Add unit tests for payment validation
- chore(deps): Bump Node.js to 18.x
- build: Upgrade webpack to v5
- ci: Add GitHub Actions workflow for release
- perf(images): Reduce LCP by preloading hero image

## Common Mistakes (and the Real Fix)

- Vague commits (“fix stuff”): write what you fixed and where.
- Oversized commits: split by intent so history stays usable.
- Missing context: add a body when the decision is not self-evident.
- Overusing chore: use build and ci when those categories fit; reserve chore for true maintenance.

## FAQ

### Should I always include a scope?

Not always, but for any non-trivial repository, scope usually pays off. It improves scan-ability and makes searching history easier.

### Is “chore” fine for everything that is not a feature?

No. Overusing chore collapses meaning. Use build and ci when appropriate, and keep chore for routine maintenance.

### What if I use squash merge and GitHub uses the PR title?

Then your PR title becomes your commit message. Apply the same standard to PR titles, or enforce it via a PR template.

### Do I need ticket IDs in commits?

If your team depends on traceability, yes. Add them consistently, preferably as a reference line rather than cluttering the summary.

## Conclusion

Commit standards are leverage. A clean history reduces the cost of reviews, debugging, and onboarding.

Use this pattern:
```
<type>(<scope>): <short summary>
```

Add a body when the “why” matters. Consistency beats perfection.



