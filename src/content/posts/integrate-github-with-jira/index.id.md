---
title: "Integrasi GitHub Enterprise Server dengan Jira"
subtitle: "Lacak Pekerjaan dari Issue hingga PR"
description: "Cara menghubungkan GitHub Enterprise Server (GHES) dengan Jira menggunakan GitHub App, pengaturan jaringan (firewall/gateway), dan konvensi alur kerja (issue keys) agar Jira menampilkan aktivitas pengembangan yang nyata."
date: "2025-12-27"
lang: "id"
keywords:
  - GitHub Enterprise Server
  - GHES
  - Jira integration
  - GitHub App
  - Atlassian
  - developer traceability
  - issue keys
  - pull requests
  - commits
  - DevOps workflow
  - enterprise tooling
  - repository permissions
---


Mengintegrasikan GitHub Enterprise Server (GHES) dengan Jira adalah salah satu langkah "usaha kecil, hasil besar": issue Jira Anda tidak lagi hanya menjadi tiket statis melainkan mulai menampilkan aktivitas pengembangan yang nyata—branch, commit, pull request, dan lainnya—dalam konteks pekerjaan itu sendiri.

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1766842153/naandalist.com/neon_cyberpunk_alley_by_n1ghtw1re_dkhcupt-414w-2x_rmhor5.jpg" alt="Integrate GitHub Enterprise Server with Jira" />
</div>



## Apa yang Anda Dapatkan Setelah Menghubungkan GHES ke Jira

Ketika Jira terhubung ke GitHub Enterprise Server, item pekerjaan (work items) di Jira dapat menampilkan aktivitas pengembangan seperti branch, commit, dan pull request. Hal ini memudahkan untuk melacak kemajuan secara langsung dari papan Jira (boards) dan tampilan issue.

Dalam praktiknya, ini membantu untuk:
- Visibilitas status yang lebih cepat bagi Product Manager (PM) dan Engineering Manager
- Handoff yang lebih rapi antara perencanaan (Jira) dan eksekusi (GitHub)
- Mengurangi copy-paste tautan dan pembaruan status secara manual

## Prasyarat

Sebelum memulai, pastikan:
- Anda memiliki akses admin Jira (atau bersama seseorang yang memilikinya)
- Anda memiliki izin admin GHES atau setara untuk membuat/mengelola GitHub App
- Batasan jaringan GHES Anda diketahui (URL publik vs di belakang firewall)

Jika GHES Anda berada di belakang firewall (kasus yang umum), Jira harus dapat berkomunikasi dengannya. Atlassian menyediakan dua pendekatan: mengizinkan (allowlist) alamat IP Atlassian, atau membuat gateway publik terkunci yang dapat digunakan Jira.

## Langkah 1: Siapkan Akses Jaringan (Firewall / Gateway)

Jika GHES Anda memiliki URL yang menghadap ke publik, Anda dapat mengizinkan akses dari alamat IP Atlassian.

Jika GHES Anda tidak memiliki URL yang menghadap ke publik—atau Anda menginginkan keamanan ekstra—gunakan pendekatan gateway publik terkunci dan berikan Jira:
- URL server gateway
- Nama header permintaan (request header name)
- Nilai kunci API (API key value)

Langkah ini adalah titik kegagalan yang paling umum. Jika Jira tidak dapat menjangkau GHES Anda, hal lainnya tidak akan berarti.

## Langkah 2: Hubungkan GitHub Enterprise Server Anda di Jira

Di Jira, hubungkan instance GHES Anda dengan memasukkan URL server dalam format yang diperlukan, dan (jika Anda menggunakan gateway) nama header dan kunci API.

Pada tahap ini, Jira sedang membangun "koneksi server". Langkah selanjutnya adalah yang benar-benar mengatur aliran data dan akses repositori: sebuah GitHub App.

## Langkah 3: Buat GitHub App (Otomatis vs Manual)

Setelah menghubungkan GHES, Jira memerlukan GitHub App untuk mengelola aliran data ke situs Jira Anda, termasuk repositori mana yang tersedia dan otomatisasi Jira apa yang dapat dipicu melalui pesan commit.

### Pembuatan Aplikasi Otomatis (Disarankan)

Pembuatan otomatis adalah jalur yang paling nyaman. Atlassian mencatat bahwa pembuatan aplikasi otomatis memerlukan versi GHES minimum untuk mendukungnya.

Jika GHES Anda memenuhi persyaratan:
- Pilih "Automatic app creation"
- Anda akan diarahkan ke GitHub untuk membuat GitHub App
- Beri nama aplikasi dengan jelas (contoh: "jira-integration-prod")

### Pembuatan Aplikasi Manual

Jika Anda tidak dapat menggunakan pembuatan otomatis, Anda dapat membuat GitHub App secara manual berdasarkan detail yang disediakan Jira. Atlassian menyediakan <a href="https://support.atlassian.com/jira-cloud-administration/docs/connect-a-github-enterprise-server-account-to-jira-software/" rel="nofollow">panduan pembuatan manual khusus</a> untuk alur ini.

## Langkah 4: Batasi Akses ke Repositori yang Tepat (Least Privilege)

Jangan hubungkan semuanya "hanya karena bisa". Anda ingin integrasi ini menunjukkan aktivitas pengembangan untuk repo yang benar-benar memetakan ke proyek Jira.

Aturan yang bagus:
- Mulailah dengan satu organisasi + satu set kecil repo
- Validasi bahwa data muncul dengan benar di issue Jira
- Perluas secara bertahap

Ini menghindari paparan data yang tidak disengaja dan mengurangi kebisingan (noise) di Jira.

## Langkah 5: Jadikan Jira Issue Keys Wajib dalam Alur Kerja Anda

Integrasi ini hanya menjadi berharga ketika tim Anda secara konsisten mereferensikan kunci issue Jira (issue keys) dalam artefak pengembangan.

Tegakkan konvensi ini:
- Nama branch menyertakan kunci issue Jira
  Contoh: PROJ-123-add-login-rate-limit
- Judul pull request menyertakan kunci issue
  Contoh: PROJ-123 Add rate limiting to login
- Pesan commit menyertakan kunci issue jika memungkinkan
  Contoh: fix(auth): prevent token refresh loop (PROJ-123)

Setelah Anda melakukan ini, Jira dapat mengasosiasikan aktivitas pengembangan dengan item pekerjaan yang tepat.

Akan lebih baik jika Anda melengkapi commit message di repo project dengan standar yang rapi. Untuk pembahasannya, baca [Standar Pesan Commit Git](https://naandalist.com/posts/git-commit-message-convention).

## Langkah 6: Validasi di Jira (Apa yang Harus Diperiksa)

Setelah penyiapan, pilih satu issue Jira dan pastikan Anda dapat melihat sinyal pengembangan seperti:
- branch yang terhubung
- commit terkait
- pull request

Jika tidak ada yang muncul:
- biasanya karena masalah akses jaringan/firewall, atau
- izin GitHub App/akses repo salah konfigurasi, atau
- tim Anda tidak menggunakan kunci issue secara konsisten.

## Catatan Keamanan dan Skalabilitas

Jika Anda mengoperasikan beberapa instance GHES (atau beberapa lingkungan), Atlassian menyatakan bahwa Anda dapat menghubungkan beberapa GitHub Server ke satu akun Jira, dan beberapa GitHub App per server.

Satu batasan yang perlu diingat: setiap GitHub App hanya dapat dihubungkan ke satu instance Jira untuk mencegah kebocoran data.

## Pemecahan Masalah: Kegagalan Umum

### Jira tidak dapat terhubung ke GHES
Ini biasanya konfigurasi firewall/IP allowlist/gateway. Periksa kembali pendekatan jaringan Anda dan pastikan Jira dapat menjangkau URL GHES yang Anda berikan.

### Pembuatan GitHub App gagal
Gunakan pembuatan aplikasi manual sebagai jalur cadangan mengikuti panduan Atlassian.

### Data terhubung tetapi tidak ada yang muncul di issue Jira
Hampir selalu karena disiplin alur kerja:
- pastikan kunci issue ada di teks branch/PR/commit
- pastikan GitHub App memiliki akses ke repositori yang benar

## FAQ

### Bisakah saya menghubungkan beberapa GitHub Enterprise Server ke satu situs Jira?
Ya. Atlassian menyatakan Anda dapat menghubungkan beberapa GitHub Server ke satu akun Jira.

### Bisakah saya menghubungkan beberapa GitHub App ke satu GitHub Server?
Ya. Anda dapat menambahkan beberapa GitHub App per server untuk menghubungkan organisasi sesuai kebutuhan.

### Bisakah saya menggunakan kembali satu GitHub App di beberapa situs Jira?
Tidak. Atlassian mencatat setiap GitHub App hanya dapat dihubungkan ke satu instance Jira untuk menjaga keamanan dan mencegah kebocoran data.

### Apa cara tercepat untuk mendapatkan nilai dari integrasi ini?
Jadikan kunci issue Jira wajib dalam nama branch dan judul PR. Tanpa disiplin itu, integrasi akan terlihat "terpasang" tetapi tidak "berguna".

## Kesimpulan

Menghubungkan GitHub Enterprise Server ke Jira itu mudah, tetapi kegunaannya bergantung pada dua hal: akses jaringan yang andal dan konvensi kunci issue yang konsisten dalam alur kerja Anda.

Lakukan penyiapan dengan hati-hati, mulai dari yang kecil, validasi, lalu kembangkan (scale). Sebagian besar tim gagal bukan karena integrasinya sulit, tetapi karena mereka tidak pernah menegakkan kebiasaan yang membuatnya bermakna.


