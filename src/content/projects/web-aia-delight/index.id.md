---
title: "AIA Delight Web App"
description: "Aplikasi internal tim marketing untuk mengelola lifecycle kupon."
date: "2023-02-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-aia-delight.webp"
techStack: ["React", "JavaScript", "Create React App"]
category: "Internal Web Application"
platforms: ["Web"]
price: "Internal"
keywords:
  [
    "AIA Delight",
    "aplikasi internal",
    "coupon management",
    "React",
    "Create React App",
    "JavaScript",
  ]
lang: "id"
---

AIA Delight adalah aplikasi web internal yang digunakan tim marketing untuk menjalankan program kupon. Aplikasi ini menyatukan penerbitan kupon, klaim customer, pengelolaan masa berlaku, dan workflow operasional terkait dalam satu interface.

Saya mengerjakan aplikasi ini selama bekerja di AIA sebagai Senior Engineer / Analyst. Berbeda dari campaign page publik, produk ini mendukung tim yang menjalankan program di balik layar. Kejelasan status dan keandalan setiap action lebih penting daripada presentasi promosi.

![Pengalaman AIA Delight](@assets/images/thumbnail-aia-delight.webp)

## Masalah Operasional

Program kupon tidak berhenti setelah campaign diluncurkan. Tim marketing tetap perlu menerbitkan kupon, menangani klaim, memantau lifecycle, dan mengelola masa berlaku secara konsisten. Aktivitas tersebut sulit dikoordinasikan ketika status dan action-nya tersebar di berbagai proses yang terpisah.

AIA Delight menyediakan interface operasional yang terfokus untuk mengelola lifecycle tersebut. Tujuannya membantu tim internal memahami apa yang telah terjadi pada sebuah kupon, action apa yang tersedia berikutnya, dan apakah kupon masih valid.

## Peran Saya

Kontribusi saya berfokus pada aplikasi web dan workflow coupon management. Saya mengimplementasikan serta memelihara frontend behavior di dalam codebase yang sudah ada, menerjemahkan proses operasional marketing menjadi interface yang dapat digunakan berulang kali dalam pekerjaan sehari-hari.

Karena aplikasi ini bersifat internal, production environment dan source code tidak tersedia untuk publik. Case study ini berfokus pada tanggung jawab produk dan konteks engineering tanpa mengungkap business rules maupun data operasional yang confidential.

## Bukti Implementasi di UAT

Screenshot berikut diambil ketika saya mengembangkan dan memvalidasi aplikasi pada environment User Acceptance Testing. Gambar tersebut memperlihatkan interface transaksi AIA Delight bersama browser Network panel dan API response yang saya gunakan untuk memeriksa data integration selama implementasi.

![Layar transaksi UAT AIA Delight dengan pemeriksaan API response](@assets/images/Screenshot-aia-delight.png)

> **Disclaimer UAT:** Screenshot ini sepenuhnya berasal dari environment UAT dan menggunakan dummy test data. Tidak ada data customer production maupun informasi pribadi di dalamnya.

## Workflow Utama

Aplikasi mendukung beberapa bagian yang saling terhubung dalam coupon lifecycle:

1. **Penerbitan kupon:** Membuat atau mendistribusikan kupon untuk aktivitas marketing yang eligible.
2. **Klaim kupon:** Menangani workflow ketika sebuah kupon diklaim.
3. **Pengelolaan masa berlaku:** Memantau validitas dan menangani kupon yang mencapai tanggal kedaluwarsa.
4. **Lifecycle visibility:** Membantu pengguna internal membedakan status kupon dan menentukan action berikutnya.

Memperlakukan semuanya sebagai satu lifecycle yang terhubung sangat penting. Penerbitan, klaim, dan kedaluwarsa bukan layar yang berdiri sendiri; setiap action mengubah hal yang boleh dilakukan setelahnya.

## Arsitektur Frontend Legacy

Aplikasi dibangun dengan [React](https://react.dev/) menggunakan setup [Create React App](https://create-react-app.dev/) legacy. Codebase masih memakai [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript), bukan TypeScript.

Bekerja di environment tersebut membutuhkan pemahaman terhadap component convention dan data flow yang sudah ada sebelum mengubah coupon behavior yang sensitif terhadap business rules. Tanpa static type checking, asumsi API dan state transition membutuhkan perhatian tambahan selama implementasi dan review.

### Tanggung Jawab Teknologi

| Teknologi                                                             | Fungsi                                                                                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [React](https://react.dev/)                                           | Menjadi component-based interface untuk operasional kupon dan reusable internal workflows.                                            |
| [Create React App](https://create-react-app.dev/)                     | Menyediakan legacy project structure, development environment, dan frontend build pipeline.                                           |
| [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | Mengimplementasikan application behavior, penanganan status kupon, dan interaction logic pada codebase non-TypeScript yang sudah ada. |

## Challenge Engineering

Challenge utamanya adalah mengembangkan aplikasi JavaScript legacy yang memiliki stateful business workflows. Operasional kupon memiliki dependency: kupon yang diterbitkan dapat berubah menjadi diklaim, validity window dapat berakhir, dan action yang tersedia harus mengikuti current state.

Kondisi tersebut membuat regression awareness menjadi penting. Adjustment UI yang terlihat lokal dapat memengaruhi hal yang boleh dilakukan pengguna internal pada tahap lifecycle berikutnya. Saya mengerjakan perubahan secara incremental dengan menelusuri behavior existing terlebih dahulu, lalu menjaga interface action tetap selaras dengan status kupon yang direpresentasikan aplikasi.

## Kenapa Ini Penting

Aplikasi internal jarang mendapatkan visibility sebesar customer-facing product, tetapi berdampak langsung pada akurasi operasional. Project ini memperkuat pengalaman saya bekerja dengan legacy React system, memodelkan stateful business workflow, dan membangun alat bagi tim non-engineering yang membutuhkan software predictable dalam pekerjaan sehari-hari.
