---
title: "Cara Membuat Commit Message yang Baik"
subtitle: "Standar praktis yang saya pakai agar histori commit tetap jelas dan bisa diaudit"
description: "Pendekatan berbasis pengalaman lapangan untuk menerapkan Conventional Commits pada tim produk, termasuk tradeoff dan tips enforcement."
date: "Jun 29 2025"
lang: "id"
keywords:
  - Git commit messages
  - conventional commits
  - commit standards
  - version control
  - code review
  - changelog automation
  - commitlint
  - team workflow
  - traceability
  - engineering practices
---

## Commit Message yang Tetap Bermanfaat Di Lapangan

Saya menulis ini sebagai **Senior Mobile Engineer dengan pengalaman 5+ tahun**. Dalam operasional produk nyata, histori commit bukan sekadar kerapian engineering, tetapi juga bukti operasional saat incident response, persiapan audit, dan keputusan rollback.

Saat tim membiarkan commit message terlalu umum, masalahnya selalu berulang: regresi lebih lama ditelusuri, review dimulai dari asumsi, dan release notes jadi pekerjaan manual tambahan. Setelah kami menegakkan konvensi yang konsisten, kualitas debugging dan handover meningkat secara nyata.

![Git Commit](https://res.cloudinary.com/naandalistcloud/image/upload/v1766840794/naandalist.com/0_h4BR91VxYGy_lSZi_el4qb6-gitcommit_ojg2ag.webp "Ilustrasi Git commit")

## Kenapa Konvensi Commit Penting Secara Praktis

Di tim yang melakukan shipping mingguan atau harian, histori commit yang rapi berfungsi seperti lapisan observability berbiaya rendah untuk memahami intent perubahan. Reviewer bisa menangkap konteks sebelum membuka diff, sementara engineer on-call dapat mempersempit kandidat commit penyebab insiden dengan lebih cepat. Untuk domain yang membutuhkan jejak perubahan jelas, konsistensi ini juga memudahkan komunikasi lintas fungsi tanpa harus merekonstruksi konteks dari awal.

## Format yang Kami Standarkan

Pola inti yang kami gunakan adalah:

```text
<type>(<scope>): <short summary>
```

Format ini selaras dengan [spesifikasi Conventional Commits](https://www.conventionalcommits.org/), dan ringkasan ditulis dengan imperative mood agar konsisten antar kontributor dan antar repositori.

Contoh praktis:

```text
fix(loan-repayment): prevent duplicate autopay submission
```

## Cara Kami Menentukan Type dan Scope

Di proyek nyata, aturan terpenting adalah satu intent untuk satu commit. Jika satu perubahan membutuhkan beberapa type, kami pecah sebelum merge karena commit dengan intent campuran menurunkan traceability. Scope diperlakukan sebagai batas subsystem yang terdampak, seperti `auth`, `kyc`, `checkout`, atau `policy-renewal`, agar pencarian di `git log` tetap efektif saat investigasi masalah spesifik.

## Kapan Commit Perlu Body

Ringkasan singkat sering cukup, tetapi untuk keputusan sensitif kami menambahkan body yang menjelaskan alasan perubahan, batasan yang dihadapi, dan tradeoff yang dipilih. Pendekatan ini membantu maintainer berikutnya memahami konteks tanpa bergantung pada ingatan atau riwayat chat.

```text
feat(policy-renewal): add grace-period validation

Why:
- prevent accidental lapse during delayed payment callback
- align with underwriting policy window

How:
- validate grace period before premium status update
- reject stale callback events by timestamp

Refs: INS-482
```

## Breaking Changes dan Kepercayaan Tim

Breaking changes harus dinyatakan secara eksplisit, bukan disembunyikan di dalam diff. Kami mewajibkan catatan `BREAKING CHANGE:` yang jelas agar tim downstream bisa menyiapkan migrasi dan menghindari kegagalan produksi yang muncul diam-diam.

```text
feat(api): rename /v1/repayment endpoint

BREAKING CHANGE: migrate clients from /v1/repayment to /v2/repayment.
```

## Referensi Otoritatif yang Kami Pakai

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Dokumentasi Git: git commit](https://git-scm.com/docs/git-commit)
- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/)

Referensi ini menjaga aturan internal kami tetap sejalan dengan standar yang diakui luas, bukan sekadar preferensi tim.

## Risiko dan Tradeoff

Standar commit yang ketat memang meningkatkan kualitas histori, tetapi ada friksi tambahan ketika tim bergerak cepat karena kontributor harus lebih disiplin memisahkan intent sebelum commit, dan reviewer perlu konsisten menolak pesan yang ambigu. Tooling seperti commitlint sangat membantu, namun enforcement yang terlalu kaku juga bisa memperlambat perbaikan darurat, sehingga guardrail harus tetap seimbang dengan kebutuhan respons insiden.

## Pelajaran Berharga

Dalam pengalaman saya, kualitas commit hanya meningkat ketika standar ditegakkan di level pull request, bukan sekadar ditulis di dokumentasi. Hasil terbaik muncul ketika format commit dianggap bagian dari kualitas delivery, ringkasan tetap spesifik ke perilaku bisnis, dan body digunakan untuk menangkap alasan keputusan yang tidak langsung terlihat dari kode.

## Tips dari Lapangan

Mulailah dari aturan minimal yang bisa dipraktikkan semua engineer dalam waktu singkat, lalu tegakkan lewat PR template dan commitlint, bukan lewat pengingat berulang di chat. Saat onboarding, gunakan contoh commit bagus dari repositori sendiri agar standar terasa konkret, dan saat retrospective, jadikan histori commit yang membingungkan sebagai input nyata untuk memperbaiki aturan secara berkelanjutan.

## Kesimpulan

Konvensi commit bukan birokrasi; ini adalah leverage. Histori yang bersih menurunkan biaya review, debugging, komunikasi rilis, dan percakapan audit, terutama pada produk yang menuntut traceability setara pentingnya dengan kecepatan delivery.
