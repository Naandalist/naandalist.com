---
title: "Info Haji"
description: "Aplikasi mobile untuk menyajikan informasi resmi haji lebih lengkap."
date: "2025-11-09"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-infohaji-app.webp"
liveURL: "https://play.google.com/store/apps/details?id=com.naandalist.info_haji"
repoURL: "https://github.com/Naandalist/info-hajj-app"
techStack: ["React Native", "TypeScript", "Redux Toolkit", "RTK Query", "React Navigation", "Jest", "Hermes"]
category: "Books & Reference"
platforms: ["Android 5.0+"]
price: "Gratis & Open Source"
keywords: ["Info Haji", "React Native", "informasi haji", "API Kemenag", "open source", "privasi"]
lang: "id"
---

Info Haji adalah hobby project independen yang saya desain, bangun, rilis, dan pelihara sendiri. Aplikasi ini membantu calon jamaah haji Indonesia dan keluarganya memeriksa detail porsi, estimasi keberangkatan, status pembayaran, antrean, kuota, serta berita terkait dari satu antarmuka mobile.

![Tangkapan layar aplikasi Info Haji](@assets/images/thumbnail-infohaji-app.webp)

## Kenapa Saya Membuatnya

Aplikasi resmi sudah menyediakan akses ke informasi haji, tetapi menurut saya antarmukanya sulit digunakan. Ketika memeriksa network response menggunakan [HTTP Toolkit](https://httptoolkit.com/), saya juga menemukan bahwa API mengembalikan sejumlah field berguna yang tidak ditampilkan oleh aplikasinya.

Gap tersebut menjadi ide produknya: menggunakan data resmi yang tersedia secara lebih lengkap dan menyajikannya melalui pengalaman yang lebih jelas serta terfokus. Info Haji tidak dibuat untuk menggantikan layanan pemerintah di baliknya. Aplikasi ini menjadi alternative client agar informasinya lebih mudah dipahami.

## Peran Saya

Saya memegang seluruh project: product direction, interface design, implementasi React Native, data modeling, keputusan privasi, testing, rilis Play Store, repository open-source, dan maintenance. Tidak ada designer, backend engineer, atau QA team terpisah.

## Arsitektur

Aplikasi menggunakan [React Native CLI](https://reactnative.dev/) 0.79.2 dan [TypeScript](https://www.typescriptlang.org/). [Redux Toolkit](https://redux-toolkit.js.org/) mengelola application state, sedangkan [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) menangani API request dan caching. [React Navigation](https://reactnavigation.org/) menyediakan struktur navigasi, dan [Hermes](https://reactnative.dev/docs/hermes) menjadi JavaScript runtime.

Info Haji tidak memiliki custom backend maupun database. Aplikasi mobile terhubung langsung ke layanan haji resmi [Kementerian Agama](https://haji.kemenag.go.id/) untuk data jamaah dan haji. Artikel terkait berasal dari [NU Online](https://www.nu.or.id/).

Arsitektur langsung ini menjaga hobby project tetap kecil dan menghilangkan data-processing layer tambahan yang seharusnya perlu saya operasikan serta amankan.

### Tanggung Jawab Teknologi

| Teknologi | Fungsi |
| --- | --- |
| [React Native CLI](https://reactnative.dev/) | Menjadi native Android application foundation yang saya desain, implementasikan, dan rilis secara independen. |
| [TypeScript](https://www.typescriptlang.org/) | Memberikan type safety pada UI components, application state, dan model response API haji yang luas. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Mengelola client-side application state dan menjaga state transition tetap predictable pada lookup flow. |
| [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) | Menangani direct request ke layanan Kemenag, response transformation, caching, serta loading dan error state. |
| [React Navigation](https://reactnavigation.org/) | Mengatur navigasi antara layar pencarian, hasil, referensi, dan berita. |
| [Hermes](https://reactnative.dev/docs/hermes) | Menjalankan JavaScript bundle aplikasi pada Android. |
| [Layanan Haji Kemenag](https://haji.kemenag.go.id/) | Menyediakan data resmi jamaah, antrean, keberangkatan, pembayaran, dan operasional haji yang dikonsumsi langsung oleh aplikasi. |
| [NU Online](https://www.nu.or.id/) | Menyediakan berita haji yang ditampilkan bersama data layanan resmi. |
| [HTTP Toolkit](https://httptoolkit.com/) | Membantu saya menginspeksi network response dan menemukan field API berguna yang tidak ditampilkan aplikasi resmi. |
| [JailMonkey](https://github.com/GantMan/jail-monkey) | Mendeteksi perangkat rooted sebagai salah satu lapisan perlindungan informasi pribadi jamaah. |
| [Jest](https://jestjs.io/) | Memverifikasi application logic dan mengurangi regression pada data-processing behavior. |

## Mengubah Response Lengkap Menjadi Informasi Berguna

Masalah engineering utamanya bukan mengumpulkan lebih banyak data. API sudah mengembalikannya. Tantangannya adalah memodelkan response yang luas dan mengubah field yang sebelumnya tersembunyi menjadi layar yang tetap mudah dipahami oleh jamaah serta keluarga.

Aplikasi menampilkan identitas porsi, posisi antrean, estimasi keberangkatan Masehi dan Hijriah, kuota provinsi, tahap pembayaran, status cadangan atau istitha'ah, informasi BPIH, detail embarkasi, jadwal penerbangan, kelompok terbang, dan informasi hotel ketika tersedia.

Menempatkan data layer di RTK Query memberi setiap layar model loading, success, dan error yang konsisten. Pendekatan ini juga memisahkan penanganan API response dari presentation sehingga UI dapat fokus pada hierarchy serta readability.

## Privasi pada Perangkat Pribadi

Pengecekan porsi dapat mengembalikan informasi pribadi jamaah. Info Haji menyimpan hasil pengecekan di perangkat pengguna untuk kemudahan akses, tetapi saya tidak mengoperasikan server yang menerima atau mengumpulkan data tersebut. [Deklarasi keamanan data Google Play](https://play.google.com/store/apps/details?id=com.naandalist.info_haji) mencatat tidak ada pengumpulan maupun pembagian data kepada pihak ketiga.

Saya menambahkan root detection menggunakan [JailMonkey](https://github.com/GantMan/jail-monkey) dan screen-capture protection untuk mengurangi paparan kasual pada perangkat yang compromised atau digunakan bersama. Kontrol ini menambah privacy friction; bukan jaminan terhadap attacker yang serius.

## Quality dan Open Source

[Jest](https://jestjs.io/) melindungi application logic, sementara linting dan pemeriksaan TypeScript mendukung kualitas kode sehari-hari. Source code lengkap tersedia di [repository GitHub publik](https://github.com/Naandalist/info-hajj-app) sehingga implementasi serta keputusan teknisnya dapat diperiksa.

Aplikasi ini tidak lagi dipelihara secara aktif. Repository tetap tersedia sebagai rekam jejak product dan engineering work.

## Impact

Google Play mencatat lebih dari [1.000 download](https://play.google.com/store/apps/details?id=com.naandalist.info_haji). Untuk solo hobby project tanpa growth atau marketing team khusus, adopsi tersebut memvalidasi manfaat penyajian informasi resmi haji melalui interface yang lebih lengkap.

## Kenapa Ini Penting

Info Haji menunjukkan cara saya menangani product experience yang belum ideal: memeriksa underlying system, menemukan informasi yang belum dimanfaatkan, merancang interface yang lebih jelas, lalu mengirimkan produk lengkap secara independen.
