---
title: "Ringkaskata.com"
description: "Platform independen untuk menerbitkan cerita positif Indonesia."
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
price: "Gratis"
keywords:
  [
    "Ringkaskata",
    "publikasi Indonesia",
    "Next.js",
    "platform editorial",
    "SEO",
    "media independen",
  ]
lang: "id"
---

Ringkaskata adalah platform publikasi Indonesia independen yang saya dirikan bersama seorang lulusan jurnalistik. Saya membangun produknya secara end-to-end agar penulis freelance memiliki ruang untuk menerbitkan karya yang sering sulit lolos verifikasi di platform besar. Arah editorial kami sederhana: menghadirkan lebih banyak cerita yang bermanfaat, positif, dan terverifikasi di tengah noise serta misinformasi di internet.

![Tangkapan layar website Ringkaskata](@assets/images/thumbnail-ringkaskata.webp)

## Peran Saya

Sebagai technical co-founder dan satu-satunya full-stack developer, saya memegang arsitektur, implementasi, deployment, serta seluruh technical trade-off, mulai dari situs publik hingga tools publikasi internal. Co-founder saya mengarahkan editorial, sementara empat kontributor penulis membuat dan mengirimkan artikel.

## Produk dan Workflow Editorial

Saya membangun dashboard admin khusus, bukan mengadopsi CMS generik. Kontributor menyiapkan artikel sebagai draft, kemudian admin yang berwenang meninjau dan menerbitkannya. Dashboard mendukung tiga level akses: guest, admin, dan superadmin.

Untuk authoring, saya mengintegrasikan rich-text editor TipTap. Penulis dapat mencari gambar thumbnail melalui Unsplash API atau mengunggah aset sendiri ke Cloudinary. Alur ini menjaga proses publikasi tetap fokus sambil memberi tim editorial kontrol yang cukup terhadap kualitas dan presentasi konten.

## Arsitektur

[Ringkaskata](https://ringkaskata.com/) berjalan sebagai aplikasi [Next.js](https://nextjs.org/) full-stack berbasis [TypeScript](https://www.typescriptlang.org/). [Neon](https://neon.com/) menyediakan database PostgreSQL serverless, dengan [Drizzle ORM](https://orm.drizzle.team/) sebagai type-safe schema dan query layer. [Resend](https://resend.com/) menangani akses admin tanpa password melalui magic link. Aplikasi dideploy di [Vercel](https://vercel.com/), dengan [Cloudflare](https://www.cloudflare.com/) digunakan untuk manajemen DNS.

Saya menambahkan sitemap generation, metadata halaman, dan integrasi [Google Search Console](https://search.google.com/search-console/about) untuk mendukung discoverability. [Ahrefs](https://ahrefs.com/) melengkapi Search Console untuk pemantauan SEO, sedangkan [Umami Cloud](https://umami.is/) menyediakan analytics pengunjung yang privacy-friendly dan gambaran aktivitas audiens.

### Tanggung Jawab Tech Stack

| Teknologi                                                                                               | Fungsi                                                                                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Next.js](https://nextjs.org/)                                                                          | Menjalankan situs publik dan custom admin dashboard sebagai satu aplikasi full-stack.      |
| [TypeScript](https://www.typescriptlang.org/)                                                           | Memberikan type safety pada frontend, server logic, dan shared data contracts.             |
| [Neon PostgreSQL](https://neon.com/)                                                                    | Menyimpan data aplikasi dan editorial dalam database PostgreSQL serverless yang terkelola. |
| [Drizzle ORM](https://orm.drizzle.team/)                                                                | Mendefinisikan database schema dan menyediakan type-safe queries antara Next.js dan Neon.  |
| [Resend](https://resend.com/)                                                                           | Mengirimkan passwordless magic link untuk autentikasi admin.                               |
| [TipTap](https://tiptap.dev/)                                                                           | Menyediakan rich-text authoring experience untuk draft artikel.                            |
| [Unsplash API](https://unsplash.com/developers)                                                         | Membantu kontributor menemukan thumbnail artikel langsung dari dashboard.                  |
| [Cloudinary](https://cloudinary.com/)                                                                   | Menyimpan dan mengirimkan gambar yang diunggah secara manual oleh tim editorial.           |
| [Vercel](https://vercel.com/)                                                                           | Menjadi hosting dan deployment platform Next.js melalui workflow yang framework-native.    |
| [Cloudflare](https://www.cloudflare.com/)                                                               | Mengelola domain dan DNS layer.                                                            |
| [Google Search Console](https://search.google.com/search-console/about) + [Ahrefs](https://ahrefs.com/) | Memantau indexing, discoverability, keyword, dan performa pencarian.                       |
| [Umami Cloud](https://umami.is/)                                                                        | Memantau visitor dan content engagement melalui analytics yang privacy-friendly.           |

## Challenge: Hosting Resilience

Sebuah insiden availability di awal proyek memperlihatkan friction pada ekosistem Cloudflare Workers untuk aplikasi Next.js ini. Saya mengevaluasi trade-off operasional lalu memigrasikan deployment ke Vercel. Migrasi ini memberi setup hosting yang lebih resilient dan native untuk Next.js, sambil tetap menggunakan Cloudflare untuk DNS.

## Discovery dan Impact

Fondasi SEO mulai menghasilkan dampak: beberapa artikel yang sudah diterbitkan mulai muncul di Google Search. Saya memantau indexing dan performa pencarian melalui Google Search Console serta Ahrefs, lalu menggunakan Umami untuk memahami aktivitas pengunjung dan konten yang mendapat perhatian.

## Workflow Engineering

Saya menggunakan Codex sebagai thinking partner saat mengevaluasi technical trade-off. Codex mempercepat riset dan brainstorming, sementara keputusan arsitektur, implementasi, dan ownership produk tetap berada di tangan saya.

## Kenapa Ini Penting

Ringkaskata mengubah hambatan publikasi menjadi platform yang dimiliki sendiri: penulis memiliki ruang untuk menerbitkan karya, editor memiliki workflow yang terfokus, dan pembaca mendapat sumber cerita Indonesia yang lebih tenang serta bermanfaat.
