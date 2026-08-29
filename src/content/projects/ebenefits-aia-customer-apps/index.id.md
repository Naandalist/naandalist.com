---
title: "AIA eBenefits App"
description: "Aplikasi mobile untuk mengakses employee benefits, eCard, klinik, dan klaim."
date: "2023-02-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-ebenefits-app.webp"
liveURL: "https://apps.apple.com/id/app/aia-ebenefits-app/id1523776118?l=id"
repoURL: ""
techStack: ["React Native", "TypeScript", "Redux Saga", "Snyk", "Dynatrace", "Azure DevOps", "patch-package"]
category: "Medical"
platforms: ["iOS", "Android"]
price: "Gratis"
keywords: ["AIA eBenefits", "React Native upgrade", "mobile modernization", "dependency security", "race condition", "production debugging"]
lang: "id"
---

AIA eBenefits memberi anggota AIA Employee Benefits Scheme di Singapura akses mobile ke manfaat asuransi, eCard, klinik rekanan, dan layanan klaim. Saya mengerjakan aplikasi production Android dan iOS ini sebagai Senior Engineer / Analyst dari Februari 2023 hingga April 2025.

![Tangkapan layar aplikasi AIA eBenefits](@assets/images/thumbnail-ebenefits-app.webp)

## Peran Saya

Saya menjadi bagian dari tim berisi lima engineer dan dua Business Analyst. Salah satu BA juga berperan sebagai delivery lead yang menjaga pekerjaan di Jira tetap selaras dengan release schedule. Tanggung jawab saya mencakup application modernization, dependency security, production debugging, implementasi, dan dokumentasi teknis.

## Challenge: Direct React Native Upgrade

Aplikasi masih berjalan pada [React Native](https://reactnative.dev/) 0.65. Native tooling dan dependencies yang menua meningkatkan maintenance cost, security findings, dan compatibility risk. Saya mendapat ownership penuh atas Jira task untuk memindahkan aplikasi production secara langsung ke React Native 0.74.

Melewati beberapa rilis framework sekaligus memusatkan perubahan besar selama bertahun-tahun ke dalam satu migrasi. Pekerjaan ini menyentuh konfigurasi build Android, Gradle, tooling iOS, CocoaPods, deprecated API, native modules, dan kompatibilitas third-party packages.

## Pendekatan Modernisasi

Saya meng-upgrade framework beserta direct dan transitive dependencies, lalu menyelesaikan build failure untuk setiap platform. Beberapa package belum mendukung target environment dengan baik. Saya menggunakan [patch-package](https://www.npmjs.com/package/patch-package) agar compatibility fixes berukuran kecil tetap eksplisit, mudah direview, dan dapat direproduksi di local development maupun CI.

Aplikasi menggunakan [Redux Saga](https://redux-saga.js.org/) untuk mengelola state dan side-effect orchestration. Menjaga business behavior existing sama pentingnya dengan membuat Android dan iOS kembali compile. Karena itu, setiap compatibility change saya perlakukan sebagai potensi product regression.

### Tanggung Jawab Teknologi

| Teknologi | Fungsi |
| --- | --- |
| [React Native](https://reactnative.dev/) | Menjadi shared application foundation Android dan iOS yang saya upgrade langsung dari versi 0.65 ke 0.74. |
| [TypeScript](https://www.typescriptlang.org/) | Memberikan type safety pada application logic, components, dan data contracts selama modernisasi. |
| [Redux Saga](https://redux-saga.js.org/) | Mengatur application state dan asynchronous side effects sambil mempertahankan business flow yang sudah berjalan. |
| [Gradle](https://gradle.org/) | Mengelola konfigurasi build Android dan kompatibilitas native dependencies yang terdampak framework upgrade. |
| [CocoaPods](https://cocoapods.org/) | Menyelesaikan dan mengintegrasikan native dependencies iOS selama proses migrasi. |
| [patch-package](https://www.npmjs.com/package/patch-package) | Menjaga compatibility fixes pada third-party packages tetap eksplisit, mudah direview, dan reproducible di local maupun CI. |
| [Snyk](https://snyk.io/) | Menemukan vulnerable dependency paths yang saya triage dan remediasi melalui upgrade direct serta transitive dependencies. |
| [Dynatrace](https://www.dynatrace.com/) | Menyediakan production monitoring dan diagnostic context untuk investigasi customer-facing issues. |
| [Azure DevOps](https://azure.microsoft.com/en-us/products/devops) | Mendukung continuous integration dan delivery pipeline aplikasi. |
| [Confluence](https://www.atlassian.com/software/confluence) | Menyimpan design review, implementation context, dan validation evidence sebelum perubahan masuk ke main codebase. |

## Validasi dan Rilis

Unit tests melindungi logic yang sudah dikenal selama migrasi. Business Analyst kemudian melakukan manual regression testing pada core journeys, edge cases, dan platform-specific behavior untuk memastikan business rules tidak berubah.

Aplikasi hasil upgrade berhasil melewati validasi dan dirilis ke production. Hasilnya memindahkan codebase dari React Native 0.65 ke 0.74 sambil mempertahankan customer workflow yang sudah berjalan.

## Dependency Security

[Snyk](https://snyk.io/) secara berkelanjutan menemukan risiko pada JavaScript dependency graph. Saya melakukan triage dan meremediasi vulnerable paths melalui upgrade direct serta transitive dependencies. Beberapa contohnya:

- [ReDoS pada `cross-spawn`](https://security.snyk.io/vuln/SNYK-JS-CROSSSPAWN-8303230)
- [Inefficient regular expression complexity pada `micromatch`](https://security.snyk.io/vuln/SNYK-JS-MICROMATCH-6838728)
- [Resource retention pada `inflight`](https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116)

Tidak setiap advisory memiliki runtime exposure yang sama dalam aplikasi mobile. Tugas engineering-nya adalah memahami setiap dependency path, menerapkan upgrade atau dependency-chain remediation yang tersedia, lalu memastikan aplikasi tetap berfungsi dengan benar.

## Menyelesaikan Issue Production Intermiten

Salah satu issue yang dialami customer muncul secara intermiten di production, tetapi tidak dapat direproduksi di staging. Pendekatan test-and-retry biasa tidak cukup karena kegagalan tersebut bergantung pada user state, timing, dan device context.

Saya mengumpulkan analytics events yang relevan, menghubungkan urutannya dengan informasi perangkat, lalu merekonstruksi kondisi saat kegagalan terjadi. Bukti tersebut mengarah pada validasi yang belum lengkap dan sebuah race condition. Saya menambahkan defensive validation serta menyesuaikan execution flow agar operasi yang bersaing tidak lagi meninggalkan aplikasi dalam state yang tidak valid.

Investigasi ini mengubah komplain customer yang tidak konsisten menjadi fix berbasis bukti meskipun tidak tersedia reproduksi yang reliable di staging.

## Observability dan Engineering Governance

Tim menggunakan [Dynatrace](https://www.dynatrace.com/) untuk production monitoring dan [Azure DevOps](https://azure.microsoft.com/en-us/products/devops) untuk delivery infrastructure. Sebelum fix atau feature digabungkan ke main codebase, kami mendokumentasikan context, design, dan validation di [Confluence](https://www.atlassian.com/software/confluence).

Praktik design review ini membentuk operational memory untuk tim. Ketika issue serupa muncul, engineer dapat menelusuri keputusan sebelumnya, membandingkan gejala, dan tidak perlu mengulang investigasi dari nol.

## Kenapa Ini Penting

Aplikasi asuransi membutuhkan stability, traceability, dan change management yang hati-hati. Pekerjaan ini menggabungkan framework modernization, dependency remediation, regression discipline, dan production forensics tanpa mengubah customer workflow yang sudah terbentuk.
