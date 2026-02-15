# Quality Gates

## Required Checks
- `bun run build`
- `bun run verify:routes`

## i18n Gate
For changes touching layout/head/nav/content links, verify in generated HTML:
- `<html lang="en">` for EN page, `<html lang="id">` for ID page
- `meta[name="language"]` matches page language
- Open Graph locale matches page language
- Internal links remain within current language namespace when expected

## SEO Gate
- Canonical URL is path-correct.
- JSON-LD URLs point to localized route when content language is `id`.
- JSON-LD `inLanguage` aligns with content language.

## Regression Gate
- No new `any` types in edited code unless justified.
- No broken alias imports.
- No route artifacts like `indexid` in generated output.
