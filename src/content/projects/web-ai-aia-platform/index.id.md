---
title: "AIA Generative AI Platform"
description: "Platform AI internal untuk memvalidasi konten marketing terhadap kebijakan perusahaan."
date: "2024-10-01"
lastUpdated: "2026-08-29"
featured: true
imageUrl: "@assets/images/generative-ai-aia-platform.webp"
techStack: ["Next.js", "Redux Toolkit", "RAG", "Google Gemini"]
category: "Internal AI Web Application"
platforms: ["Web"]
price: "Internal"
keywords: ["AIA Generative AI Platform", "content validation", "marketing compliance", "Next.js", "Redux Toolkit", "RAG", "Gemini"]
lang: "id"
---

AIA Generative AI Platform adalah aplikasi internal untuk memvalidasi marketing assets sebelum dibagikan melalui media sosial publik. Tim marketing dapat mengirimkan konten gambar atau dokumen PDF, lalu memeriksa apakah materi tersebut sesuai dengan standar kebijakan perusahaan.

Saya mengerjakan platform ini selama bekerja di AIA sebagai Senior Engineer / Analyst. Project ini menggabungkan web-based review workflow dengan generative AI dan retrieval-augmented generation agar policy context tersedia selama proses analisis konten.

![Layar login AIA Generative AI Platform](@assets/images/generative-ai-aia-platform.webp)

## Masalah Produk

Materi marketing publik harus memenuhi kebijakan perusahaan sebelum diterbitkan. Sebuah gambar atau PDF dapat memiliki banyak elemen yang perlu diperiksa, sementara standar yang relevan dapat tersebar di berbagai policy documents.

Platform ini memberi tim marketing internal satu tempat untuk mengirimkan konten, menerapkan rules yang relevan, dan memeriksa findings sebelum materi masuk ke public channel. Sistem mendukung human review dengan menyusun hasil validasi secara terstruktur, bukan menjadikan generative model sebagai penentu akhir kebijakan.

## Peran Saya

Kontribusi saya mencakup web application flow, state management, dan integrasi antara content-validation experience dengan AI pipeline. Saya menerjemahkan kebutuhan policy validation menjadi interface yang memungkinkan pengguna membuat validation request, memantau processing status, dan memeriksa hasilnya.

Karena platform ini bersifat internal, production environment, policy corpus, dan source code tidak tersedia untuk publik. Case study ini berfokus pada system design serta user workflow tanpa menampilkan isi kebijakan internal.

## Workflow Validasi Konten

Aplikasi menyusun validasi sebagai proses yang dapat direview:

1. **Mengirimkan konten:** Pengguna dari tim marketing menyediakan gambar atau dokumen PDF untuk divalidasi.
2. **Mengambil policy context:** Workflow RAG menyediakan context kebijakan perusahaan yang relevan untuk materi tersebut.
3. **Menganalisis dengan Gemini:** Gemini mengevaluasi konten terhadap context yang telah diambil.
4. **Menyusun findings:** Platform menampilkan rules yang diterapkan, impact severity, processing status, dan validation date.
5. **Mendukung review:** Tim marketing dapat memeriksa hasil sebelum menentukan apakah materi siap dibagikan ke media sosial publik.

Flow ini menjaga AI output tetap terhubung dengan submitted asset dan policy context yang digunakan untuk mengevaluasinya.

## Interface Validasi

Validation dashboard memberikan visibility untuk berbagai content collections. Setiap baris merangkum jumlah rules yang diterapkan, mengelompokkan findings berdasarkan impact severity, menunjukkan apakah proses sudah selesai atau masih berjalan, dan mencatat validation date.

![Dashboard content validation AIA Generative AI Platform](@assets/images/Screenshot-generative-ai-aia-platform.png)

Interface ini membuat hasil analisis AI lebih mudah direview. Alih-alih hanya mengembalikan generated text, aplikasi menampilkan operational signals yang membantu pengguna membandingkan hasil validasi dan menemukan higher-impact findings.

## Arsitektur

Web application dibangun dengan [Next.js](https://nextjs.org/). [Redux Toolkit](https://redux-toolkit.js.org/) mengelola client-side workflow state pada proses content submission, processing, dan result display.

AI layer menggunakan [retrieval-augmented generation](https://cloud.google.com/use-cases/retrieval-augmented-generation) dengan [Google Gemini](https://ai.google.dev/gemini-api/docs). RAG menyediakan policy context yang relevan, sedangkan Gemini menganalisis gambar atau PDF terhadap context tersebut dan menghasilkan findings untuk ditampilkan oleh aplikasi.

### Tanggung Jawab Teknologi

| Teknologi | Fungsi |
| --- | --- |
| [Next.js](https://nextjs.org/) | Menjadi web application foundation untuk authentication, content submission, validation history, dan result review. |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Mengatur client-side state untuk uploaded content, processing status, filter, dan validation results. |
| [Retrieval-augmented generation](https://cloud.google.com/use-cases/retrieval-augmented-generation) | Memberikan company-policy context yang relevan pada setiap validation request sebelum model melakukan analisis. |
| [Google Gemini](https://ai.google.dev/gemini-api/docs) | Menganalisis konten gambar dan PDF terhadap context yang diambil, lalu menghasilkan policy-related findings. |

## Challenge Engineering

Challenge utamanya adalah mengubah generative AI output menjadi internal workflow yang dapat direview. Jawaban pass atau fail saja akan menyembunyikan terlalu banyak context. Pengguna marketing perlu melihat rules yang diterapkan, severity dari findings, dan apakah analisis sudah selesai.

RAG menjawab concern berikutnya: policy validation perlu menggunakan company-specific context, bukan hanya mengandalkan general knowledge milik model. Aplikasi kemudian mengubah grounded analysis tersebut menjadi informasi terstruktur yang sesuai untuk operational review.

## Kenapa Ini Penting

Project ini menunjukkan cara saya menerapkan generative AI sebagai bagian dari product workflow nyata. Nilainya berasal dari kombinasi model capability, policy grounding, state management, dan reviewable interface untuk tim internal yang bertanggung jawab terhadap konten publik.
