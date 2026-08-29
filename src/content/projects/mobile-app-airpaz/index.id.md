---
title: "Airpaz: Pemesanan Pesawat & Hotel"
description: "Cara saya meningkatkan pengalaman pencarian hotel Airpaz, mengotomatisasi rilis mobile, dan memperkuat alur booking kritikal di Android serta iOS."
date: "2025-04-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/thumbnail-airpaz.webp"
liveURL: "https://play.google.com/store/apps/details?id=com.atnetwork.airpazdev&hl=id"
repoURL: ""
techStack:
  [
    "React Native",
    "TypeScript",
    "Redux Toolkit",
    "React Query",
    "Maestro",
    "Fastlane",
    "Sentry",
  ]
category: "Travel & Local"
platforms: ["iOS", "Android"]
price: "Gratis"
keywords:
  [
    "Airpaz",
    "React Native",
    "pemesanan hotel",
    "progressive loading",
    "mobile testing",
    "release automation",
  ]
lang: "id"
---

Airpaz adalah platform perjalanan untuk memesan tiket pesawat dan hotel di berbagai market. Saya bekerja sebagai Frontend Developer pada aplikasi mobile React Native dan aplikasi web React, sebagai bagian dari tim frontend berisi enam orang yang berbagi ownership untuk Android, iOS, dan web.

![Tangkapan layar aplikasi Airpaz](@assets/images/thumbnail-airpaz.webp)

## Peran Saya

Saya membangun dan memelihara fitur booking yang digunakan pelanggan dari April 2025 hingga Juni 2026. Cakupan pekerjaan saya meliputi product delivery, state management yang berorientasi pada performa, automated testing, release tooling, dan investigasi issue production. Saya berkolaborasi dengan lima frontend engineer lain, termasuk frontend lead.

## Challenge: Drop-off pada Pencarian Hotel

Analytics internal menunjukkan bahwa banyak pengguna berhenti ketika menunggu hasil pencarian hotel. Nama dan gambar hotel sebenarnya sudah tersedia, tetapi data harga membutuhkan waktu lebih lama. Menahan seluruh tampilan sampai semua field siap membuat pengalaman terasa lebih lambat dari kondisi sebenarnya.

Flow pencarian pesawat sudah memiliki pattern progressive loading yang serupa, tetapi pencarian hotel mempunyai data dan behavior berbeda. Saya mengadaptasi idenya tanpa menyalin implementasinya secara langsung.

## Solusi: Hasil Hotel secara Progresif

Saya mengubah pencarian hotel agar data yang sudah siap dapat langsung ditampilkan. Pengguna bisa mulai melihat nama, gambar, dan detail utama hotel sementara data harga terus dimuat secara progresif di background melalui flow yang menyerupai polling.

Saya menempatkan orchestration dan business rules di middleware [Redux Toolkit](https://redux-toolkit.js.org/). Pendekatan ini menjaga timing, penggabungan data, dan state transition tetap berada di luar presentation layer. UI hanya mengonsumsi state terbaru yang sudah siap sehingga komponennya lebih mudah dipahami dan dipelihara.

Internal tracking menunjukkan peningkatan retention pengguna pada flow pencarian hotel setelah perubahan tersebut. Angka detailnya bersifat internal, tetapi arahnya mengonfirmasi bahwa pengurangan perceived waiting time memperbaiki pengalaman booking.

## Arsitektur dan Tooling

Aplikasi mobile menggunakan [React Native](https://reactnative.dev/) dan [TypeScript](https://www.typescriptlang.org/) untuk Android serta iOS. [Redux Toolkit](https://redux-toolkit.js.org/) mengelola application state dan orchestration pencarian progresif, sementara [TanStack Query](https://tanstack.com/query/latest) mendukung server-state workflow.

Untuk development dan diagnosis production, tim menggunakan [Flipper](https://fbflipper.com/), [Rozenite](https://rozenite.dev/), analytics tracker internal, dan [Sentry](https://sentry.io/). Tracker tersebut merekam interaction events seperti klik cancel dan submit sehingga kami dapat merekonstruksi user journey serta menganalisis behavior. Seluruh tooling ini membantu kami memeriksa behavior aplikasi, menemukan masalah pada user flow, dan menginvestigasi issue production.

### Tanggung Jawab Teknologi

| Teknologi | Fungsi |
| --- | --- |
| [React Native](https://reactnative.dev/) | Menjadi shared mobile foundation untuk aplikasi Android dan iOS. |
| [TypeScript](https://www.typescriptlang.org/) | Memberikan type safety pada UI components, application state, dan booking data contracts. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Mengelola client state dan menjalankan orchestration pencarian hotel progresif melalui middleware. |
| [TanStack Query](https://tanstack.com/query/latest) | Menangani server-state requests, caching, dan sinkronisasi dengan booking services. |
| [Flipper](https://fbflipper.com/) | Mendukung application, network, dan native debugging selama development. |
| [Rozenite](https://rozenite.dev/) | Memperluas React Native developer tooling untuk runtime inspection. |
| Internal analytics tracker | Merekam interaction events seperti klik cancel dan submit untuk merekonstruksi user journey, menganalisis behavior, dan menemukan drop-off. |
| [Sentry](https://sentry.io/) | Merekam production errors dan menyediakan diagnostic context untuk investigasi incident. |
| [Maestro](https://maestro.dev/) | Menjalankan end-to-end checks yang repeatable untuk flow booking hotel dan pesawat kritikal. |
| [Fastlane](https://fastlane.tools/) | Mengotomatisasi mobile build dan release tasks. |
| [GitLab Runner](https://docs.gitlab.com/runner/) | Menjalankan CI/CD jobs pada mobile delivery pipeline. |
| [Slack incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) | Mengirim build-completion notifications tanpa mengharuskan engineer memantau CI dashboard. |

## Melindungi Flow Booking Kritikal

Saya memperkenalkan coverage end-to-end menggunakan [Maestro](https://maestro.dev/) untuk perjalanan booking hotel dan pesawat yang kritikal. Saya juga membuat reusable mocks agar skenario penting bisa dijalankan secara konsisten tanpa sepenuhnya bergantung pada live services.

Automasi ini memberikan pemeriksaan berulang pada flow dengan risiko produk terbesar dan mengurangi ketergantungan terhadap verifikasi manual saja.

## Release Automation

Build mobile berjalan melalui [Fastlane](https://fastlane.tools/) dan [GitLab Runner](https://docs.gitlab.com/runner/). Sebelumnya, anggota tim perlu berulang kali memeriksa CI dashboard untuk mengetahui apakah build sudah selesai.

Saya membangun bot notifikasi Slack yang mengirimkan status penyelesaian build langsung kepada tim. Perubahan ini menghilangkan kebutuhan memantau dashboard secara repetitif dan membuat status rilis terlihat di tempat komunikasi engineering berlangsung.

## Skala Produk

[Listing Google Play](https://play.google.com/store/apps/details?id=com.atnetwork.airpazdev&hl=id) mencatat lebih dari satu juta download dan rating di atas empat bintang. Produk ini mendukung berbagai market, bahasa, maskapai, mata uang, serta metode pembayaran. Artinya, perubahan frontend yang terfokus sekalipun tetap berjalan dalam sistem booking dengan variasi tinggi.

## Kenapa Ini Penting

Pekerjaan ini menghubungkan frontend engineering dengan behavior produk yang terukur. Hasil progresif mengurangi perceived waiting dalam pencarian hotel, automated tests melindungi flow booking yang kritikal terhadap pendapatan, dan notifikasi rilis mengurangi friction dalam operasional harian tim.
