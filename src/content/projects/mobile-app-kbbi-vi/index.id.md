---
title: "Kamus KBBI VI"
description: "Kamus Indonesia gratis tanpa iklan dengan Python harvesting pipeline, corpus JSON terbuka, dan fuzzy word discovery di React Native."
date: "2022-12-11"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-kbbi-app.webp"
liveURL: "https://play.google.com/store/apps/details?id=com.naandalist.kamus_kbbi"
repoURL: "https://github.com/Naandalist/kbbi-app"
techStack: ["React Native", "TypeScript", "Hermes", "Python", "Fuzzy Search", "jsDelivr", "ProGuard/R8"]
category: "Books & Reference"
platforms: ["Android 5.0+"]
price: "Gratis & Tanpa Iklan"
keywords: ["KBBI VI", "kamus Indonesia", "React Native", "Python scraper", "fuzzy search", "open data pipeline"]
lang: "id"
---

Kamus KBBI VI adalah kamus Bahasa Indonesia gratis tanpa iklan yang saya desain, bangun, rilis, dan terus pelihara secara independen. Aplikasi ini menggabungkan interface React Native modern dengan data pipeline yang saya bangun dari nol untuk menyajikan entri lebih kaya, termasuk definisi, contoh penggunaan, kata turunan, dan peribahasa.

![Tangkapan layar aplikasi Kamus KBBI VI](@assets/images/thumbnail-kbbi-app.webp)

## Kenapa Saya Membuatnya

Aplikasi kamus resmi dapat digunakan, tetapi interface-nya terasa lama dan belum menyajikan detail yang saya harapkan dari sebuah referensi bahasa. Context penting seperti contoh dan peribahasa sulit ditemukan atau tidak hadir dalam pengalaman utamanya.

Saya melihat keterbatasan tersebut sebagai masalah produk sekaligus engineering. Interface yang lebih baik saja belum cukup; saya perlu lebih dahulu membangun dataset lengkap dan queryable untuk mendukungnya.

## Peran Saya

Ini adalah solo hobby project. Saya memegang product direction, UI design, implementasi mobile, data acquisition pipeline, search behavior, optimasi Android, rilis Play Store, dan ongoing maintenance. Saya juga memilih menjaga aplikasi tetap gratis, tanpa iklan maupun analytics SDK.

## Membangun Dataset dari A sampai Z

Bagian tersulit dikerjakan sebelum mobile interface dapat mencari apa pun. Saya lebih dahulu menyusun daftar kosakata Bahasa Indonesia secara alfabetis dari A sampai Z. Setelah itu, saya membangun automasi Python untuk meminta dan mem-parse halaman detail setiap kata dari [website KBBI resmi](https://kbbi.kemdikbud.go.id/).

Pipeline mengubah setiap entri menjadi structured JSON dan mengelompokkan output berdasarkan huruf awal serta kata. Pendekatan ini mempertahankan field yang lebih kaya seperti makna, contoh penggunaan, kata turunan, kategori, dan peribahasa—bukan mengurangi entri menjadi satu definisi saja.

Corpus hasil generasi dipublikasikan dalam [repository KBBI Harvester CDN](https://github.com/Naandalist/kbbi-harvester-cdn) yang open-source. Konten kamus tetap diatribusikan kepada otoritas Bahasa Indonesia; aplikasi dan pipeline ini merupakan interface independen serta tidak resmi terhadap sumber tersebut.

## Lightweight Data Delivery

Alih-alih menanam seluruh corpus ke setiap rilis aplikasi, masing-masing entri JSON dikirim melalui [jsDelivr](https://www.jsdelivr.com/) dari dataset GitHub publik. Word list mendukung discovery, sedangkan detail entri hanya diambil setelah pengguna memilih kata.

Pemisahan ini menjaga ukuran application package tetap lebih kecil dan memungkinkan open corpus berkembang secara independen dari mobile binary. Trade-off-nya jelas: pencarian detail membutuhkan koneksi jaringan untuk mencapai CDN.

## Pengalaman Pencarian

Aplikasi menggabungkan filter langsung dengan fuzzy matching. Hasil exact dan menyerupai prefix tetap mudah ditemukan, sedangkan approximate matching membantu pengguna ketika ejaannya belum lengkap atau sedikit keliru.

Saya sengaja menjaga search behavior tetap sederhana dan predictable. Alih-alih menggunakan angka performa yang tidak terukur, desainnya berfokus pada pengurangan candidate set secara cepat dan hanya memuat JSON detail milik kata yang dipilih.

## Arsitektur dan Optimasi Mobile

Client dibangun menggunakan [React Native CLI](https://reactnative.dev/) dan [TypeScript](https://www.typescriptlang.org/). [Hermes](https://reactnative.dev/docs/hermes) digunakan sebagai JavaScript runtime. Pada Android, [ProGuard dan R8](https://developer.android.com/build/shrink-code) menghapus unused code dan mengoptimalkan release build untuk mengurangi ukuran aplikasi.

Project tidak menggunakan advertising atau analytics SDK. Search terms dan history tidak disimpan secara lokal. Network traffic terbatas pada pengambilan data kamus publik yang dibutuhkan untuk pengalaman lookup.

### Tanggung Jawab Teknologi

| Teknologi | Fungsi |
| --- | --- |
| [Python](https://www.python.org/) | Mengotomatisasi word discovery dari A sampai Z, melakukan scraping setiap halaman detail KBBI resmi, parsing konten, dan menghasilkan structured JSON. |
| [KBBI Harvester CDN](https://github.com/Naandalist/kbbi-harvester-cdn) | Menyimpan open corpus hasil generasi secara terpisah dari mobile client, dikelompokkan berdasarkan huruf awal dan kata. |
| [jsDelivr](https://www.jsdelivr.com/) | Mengirim setiap file JSON kamus dari corpus GitHub publik tanpa membutuhkan custom backend. |
| Fuzzy matching | Menemukan kandidat terdekat ketika query belum lengkap atau sedikit salah eja, sambil mempertahankan exact filtering yang sederhana. |
| [React Native CLI](https://reactnative.dev/) | Menjadi native Android application foundation untuk pencarian, discovery, dan tampilan detail kamus. |
| [TypeScript](https://www.typescriptlang.org/) | Memberikan type safety pada UI components, search behavior, dan struktur data kamus. |
| [Hermes](https://reactnative.dev/docs/hermes) | Menjadi JavaScript runtime untuk Android client. |
| [ProGuard dan R8](https://developer.android.com/build/shrink-code) | Menghapus unused code dan mengoptimalkan Android release binary agar ukuran aplikasi lebih kecil. |

## Open Source dan Maintenance

Source mobile tersedia di [repository aplikasi KBBI](https://github.com/Naandalist/kbbi-app), sementara corpus kamus hasil generasi berada secara terpisah di [repository harvester](https://github.com/Naandalist/kbbi-harvester-cdn). Pemisahan tanggung jawab client dan data menjaga kedua project lebih mudah diperiksa serta dipelihara.

Aplikasi diluncurkan pada 11 Desember 2022 dan masih aktif dipelihara.

## Impact

Google Play mencatat lebih dari [10.000 download](https://play.google.com/store/apps/details?id=com.naandalist.kamus_kbbi). Pengguna juga menyampaikan bahwa aplikasi membantu mereka mengakses informasi kata Bahasa Indonesia yang lebih kaya melalui pengalaman yang lebih bersih.

## Kenapa Ini Penting

Kamus KBBI VI mewakili lebih dari sebuah mobile UI. Saya membangun data acquisition pipeline, menyusun dan mendistribusikan corpus, merancang fuzzy discovery, mengoptimalkan Android binary, serta mengoperasikan produk hasilnya selama beberapa tahun.
