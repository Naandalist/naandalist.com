---
title: "Cara Membuat Commit Message yang Baik"
subtitle: "Temukan bagaimana pesan commit yang tepat menghasilkan codebase yang lebih tertata dan rapi"
description: "Cara menggunakan standar Conventional Commits yang sederhana untuk pesan commit Git—tipe, scope, contoh, dan praktik terbaik untuk meningkatkan review dan debugging."
date: "Jun 29 2025"
lang: "id"
keywords:
  - Git commit messages
  - conventional commits
  - commit standards
  - version control
  - code documentation
  - development workflow
  - Git best practices
  - team collaboration
  - code review
  - commit conventions
---

## Commit Message yang Benar-Benar Berguna

Seharusnya commit message bukanlah sekedar catatan asal jadi. Ia adalah kontrak dengan diri Anda di masa depan dan rekan setim Anda: apa yang berubah, di mana itu berubah, dan mengapa itu penting. Ketika histori commit mudah dibaca, code review berjalan lebih cepat, debugging menjadi lebih efisien, dan rilis lebih mudah dipahami.

![Git Commit](https://res.cloudinary.com/naandalistcloud/image/upload/v1766840794/naandalist.com/0_h4BR91VxYGy_lSZi_el4qb6-gitcommit_ojg2ag.webp "Ilustrasi Git commit")

## Mengapa Standar Commit Itu Berharga

Anda bisa saja "sekadar commit dan lanjut", tetapi Anda akan kesulitan di masa depan kelak. Sebagian besar tim merasakan akibatnya ketika mereka perlu melacak regresi, mengaudit perubahan, atau melakukan onboarding insinyur baru yang harus memahami basis kode dengan cepat.

Standar commit yang konsisten membantu Anda:

- Memindai `git log` dan memahami maksud tanpa membuka file.
- Mengurangi waktu review karena konteks sudah jelas sebelum membaca diff.
- Menyelidiki bug lebih cepat dengan menemukan titik pengenalan yang paling mungkin.
- Mengaktifkan otomatisasi untuk changelog dan catatan rilis dengan lebih sedikit pekerjaan manual.

Jika tim Anda sering melakukan pengiriman (ship), ini bukan preferensi kosmetik. Ini adalah kebersihan operasional.

## Format Conventional Commits

Gunakan pola yang dapat diprediksi yang mudah dipindai:

```
<type>(<scope>): <short summary>
```

- type: jenis perubahan apa ini
- scope (opsional tapi disarankan): bagian dari basis kode yang terpengaruh
- short summary: apa yang Anda lakukan, ditulis dalam bentuk perintah (imperative mood)

Jika Anda menginginkan referensi resmi, ikuti [spesifikasi Conventional Commits](https://www.conventionalcommits.org/).

## Tipe yang Sebaiknya Anda Gunakan (dan Kapan)

Pilih satu tipe per commit. Jika Anda membutuhkan beberapa tipe, commit tersebut mungkin terlalu besar dan harus dipisah berdasarkan tujuannya.

| Tipe | Gunakan ketika Anda... |
| --- | --- |
| feat | menambahkan fitur baru atau peningkatan yang berarti |
| fix | menyelesaikan bug atau regresi |
| docs | mengubah dokumentasi saja (README, panduan, komentar) |
| style | menerapkan perubahan format tanpa perubahan perilaku |
| refactor | merestrukturisasi kode tanpa mengubah perilaku eksternal |
| test | menambahkan atau memodifikasi tes |
| chore | melakukan pekerjaan pemeliharaan (deps, tooling, config kecil) |
| build | mengubah sistem build atau pengaturan dependensi eksternal |
| ci | mengubah konfigurasi pipeline CI/CD |
| perf | meningkatkan performa dengan cara yang terukur atau dapat dibenarkan dengan jelas |

## Scope: Detail Kecil, Manfaat Besar

Scope menjawab pertanyaan sederhana: di mana perubahan ini terjadi? Ini membuat riwayat commit dapat dicari dan mengurangi ambiguitas.

Pola scope umum meliputi:
- auth, checkout, payments, api, ui, infra, docs

Contoh:
- feat(auth): Add refresh token rotation
- fix(checkout): Prevent double submit on pay button
- refactor(api): Consolidate retry logic

## Ringkasan Singkat: Tulis Seperti Sebuah Perintah

Ringkasan yang baik terbaca seperti instruksi yang jelas. Gunakan kata kerja imperatif:

- Add, Fix, Update, Remove, Refactor, Improve, Simplify, Prevent

Hindari ringkasan yang samar seperti "fix bug" atau "update stuff." Mereka tidak memberikan nilai apa pun ketika Anda meninjau kembali riwayat.

Pedoman agar tetap mudah dibaca:
- Gunakan bentuk imperatif (Add, Fix, Improve), bukan bentuk lampau (Added, Fixed).
- Tetap ringkas (targetkan 50–70 karakter).
- Hindari menggabungkan perubahan yang tidak terkait dalam satu commit.

Baik ✅ :
- Add avatar upload
- Fix form submission error
- Improve image preload strategy

Buruk ❌:
- Added avatar upload
- Fix bug
- Some changes

## Ketika Anda Butuh Konteks Lebih: Tambahkan Body

Jika "mengapa"-nya tidak jelas, tulis body. Di sinilah Anda merekam maksud, kompromi (trade-offs), dan batasan. Ini sangat berharga ketika perbaikannya halus atau keputusannya kontroversial.

Struktur sederhana yang bekerja dengan baik:

```
feat(auth): Add refresh token rotation

Why:
- Reduce forced logouts on mobile
- Limit token replay risk

How:
- Rotate on refresh
- Revoke previous token id in storage

Notes:
- Requires API v2 endpoint /auth/refresh
```

Jika alur kerja Anda memerlukan keterlacakan (traceability), tambahkan referensi ke tiket atau masalah secara konsisten:

- Refs: PAY-214

## Perubahan yang Memutus Kompatibilitas (Breaking Changes)

Jika sebuah commit memutus kompatibilitas, jangan sembunyikan. Nyatakan dengan jelas dan sertakan apa yang harus dilakukan pengguna hilir untuk bermigrasi.

Ini bukan pilihan. Breaking changes yang tersembunyi adalah salah satu cara tercepat untuk menghancurkan kepercayaan pada sebuah repositori.

Contoh:

```
feat(api): Rename /v1/orders endpoint

BREAKING CHANGE: Clients must migrate from /v1/orders to /v2/orders.
```

## Contoh Siap Pakai

- feat(user-profile): Add avatar upload
- fix(login): Show correct error for invalid password
- docs(readme): Add local setup steps for iOS
- style(ui): Format files to satisfy lint rules
- refactor(api): Simplify pagination query building
- test(checkout): Add unit tests for payment validation
- chore(deps): Bump Node.js to 18.x
- build: Upgrade webpack to v5
- ci: Add GitHub Actions workflow for release
- perf(images): Reduce LCP by preloading hero image

## Kesalahan Umum (dan Cara Memperbaikinya)

- Vague commits (“fix stuff”): tulis apa yang Anda perbaiki dan di mana.
- Oversized commits: pisahkan berdasarkan tujuan agar riwayat tetap dapat digunakan.
- Missing context: tambahkan body ketika keputusannya tidak terbukti dengan sendirinya.
- Overusing chore: gunakan build dan ci ketika kategori tersebut cocok; simpan chore untuk pemeliharaan yang sebenarnya.

## FAQ

### Haruskah saya selalu menyertakan scope?

Tidak selalu, tetapi untuk repositori non-trivial, scope biasanya membuahkan hasil. Ini meningkatkan kemampuan pemindaian (scan-ability) dan membuat pencarian riwayat lebih mudah.

### Apakah “chore” baik untuk segala sesuatu yang bukan fitur?

Tidak. Menggunakan chore secara berlebihan meruntuhkan makna. Gunakan build dan ci jika sesuai, dan simpan chore untuk pemeliharaan rutin.

### Bagaimana jika saya menggunakan squash merge dan GitHub menggunakan judul PR?

Maka judul PR Anda menjadi pesan commit Anda. Terapkan standar yang sama untuk judul PR, atau tegakkan melalui template PR.

### Apakah saya perlu ID tiket di dalam commit?

Jika tim Anda bergantung pada keterlacakan (traceability), ya. Tambahkan mereka secara konsisten, lebih baik sebagai baris referensi daripada memadati ringkasan.

## Kesimpulan

Standar commit adalah daya ungkit. Riwayat yang bersih mengurangi biaya code review, debugging, dan onboarding.

Gunakan pola ini:
```
<type>(<scope>): <short summary>
```

Tambahkan body ketika "mengapa"-nya penting. Konsistensi mengalahkan kesempurnaan.
