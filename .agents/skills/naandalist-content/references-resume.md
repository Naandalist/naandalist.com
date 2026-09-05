# Resume routes

Resumes are not a content collection. PDF files live in `public/resume/`.

- `/resume` and `/id/resume` list every PDF as a card
- `/resume/{slug}` opens the viewer (`slug` = filename without `.pdf`)
- `/resume/{filename}.pdf` is the raw file
- List and detail pages are `noindex` and excluded from the sitemap
- Footer Resume links to `/resume` or `/id/resume`

Add a new resume by dropping `Listiananda-Apriliawan-{Role}.pdf` into `public/resume/`.
