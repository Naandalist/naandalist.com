---
title: "Respon API Parsial untuk UX yang Lebih Baik"
subtitle: "Utamakan Pengalaman Pengguna, Kesempurnaan Data Nomor Dua"
description: "Pola kontrak API berbasis pengalaman lapangan untuk mengirim data inti lebih cepat, sementara field lambat diselesaikan asinkron tanpa memblokir layar penuh."
date: "2025-11-16"
featured: true
lang: "id"
keywords:
  - API design
  - UX optimization
  - partial responses
  - progressive loading
  - backend performance
  - React Native
  - mobile app optimization
  - loading states
  - user experience
  - API patterns
---

![Neon Skies and Chrome Dreams](https://res.cloudinary.com/naandalistcloud/image/upload/v1763224844/naandalist.com/neon_skies_and_chrome_dreams_by_inkimagine_dk5niy4-pre_va6ndy.jpg)

Saya menulis ini sebagai **5+ YOE engineer**.

## Ketika "Data Lengkap" Menjadi Bug UX

Di salah satu alur produksi, endpoint halaman produk kami mengembalikan payload lengkap dalam sekitar lima detik. Secara teknis benar, tetapi secara pengalaman pengguna jelas bermasalah. Data analitik sesi menunjukkan drop-off tinggi di detik kedua sampai ketiga, jadi banyak pengguna keluar sebelum melihat konten yang berarti.

Setelah profiling jalur request, kami menemukan ketimpangan yang jelas: field identitas produk relatif cepat, sedangkan harga bergantung pada pipeline downstream yang lebih lambat. Karena endpoint dirancang all-or-nothing, field paling lambat menahan seluruh respons. Kami tanpa sadar mengutamakan kemurnian payload sambil mengorbankan kepercayaan pengguna.

## Kontrak yang Kami Terapkan

Kami mengubah kontrak dari "semua harus siap sekarang" menjadi "yang siap dikirim sekarang, yang tertunda dinyatakan eksplisit." Endpoint utama mengembalikan data inti secepat mungkin plus tracking token dan completion flag untuk field lambat.

```json
{
  "id": "123",
  "track_id": "track-999",
  "name": "Sepatu Lari",
  "description": "Sepatu lari ringan untuk latihan sehari-hari.",
  "seller": "Toko Olahraga",
  "address": "Jl. Contoh 123",
  "price": null,
  "priceComplete": false
}
```

Kontrak ini jujur secara semantik: produk ada, sebagian besar data siap, dan harga masih diproses.

## Endpoint Penyelesaian dan Perilaku UI

Alih-alih memanggil ulang `/product`, klien menggunakan endpoint khusus dengan `track_id`.

```txt
POST /getPrice
Content-Type: application/json
```

```json
{
  "track_id": "track-999",
  "productId": "123"
}
```

Jika perhitungan harga masih berjalan, endpoint mengembalikan `priceComplete: false`; jika selesai, endpoint mengembalikan harga final dengan `priceComplete: true`. UI merender field identitas lebih dulu, menahan loading state hanya di komponen harga, dan menghentikan retry saat completion flag sudah terminal.

## Terminal Null Bukan "Masih Loading"

Edge case yang paling penting adalah terminal failure, yaitu proses selesai tetapi harga tetap tidak tersedia.

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": true
}
```

State ini tidak boleh diperlakukan sebagai "masih memuat." Di implementasi kami, retry dihentikan dan fallback deterministik diterapkan (misalnya, item disembunyikan di daftar yang sensitif terhadap harga). Kejelasan state ini mencegah loading loop tanpa akhir dan perilaku UI yang tidak konsisten antar perangkat.

### Diagram Alur

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1763224832/naandalist.com/Untitled_diagram-2025-11-15-163928_ym4pao.svg" alt="Diagram Alur Respon Parsial" />
  <p style="font-size: 0.875rem;"><em>Diagram alur yang menunjukkan pola respon parsial</em></p>
</div>

## Risiko dan Tradeoff

Respon parsial meningkatkan perceived performance, tetapi menambah kompleksitas kontrak karena backend dan klien harus menyepakati semantik state pending, complete, dan terminal failure secara ketat. Pola ini juga menambah beban operasional, termasuk tuning retry policy, ekspektasi idempotency, dan penanganan stale state saat pengguna berpindah layar dengan cepat atau melanjutkan aplikasi dari background.

## Pelajaran Berharga

Dampak terbesar justru datang dari pemodelan transisi state yang eksplisit, bukan dari optimasi infrastruktur kecil di awal. Saat state response dijadikan bagian formal dari kontrak API, perilaku UI menjadi lebih prediktif, observability menjadi lebih mudah, dan diskusi produk bergeser dari "kenapa loading lama" ke "state apa yang dilihat pengguna dan kenapa."

## Tips dari Lapangan

Mulailah dari satu field lambat yang penting untuk bisnis tetapi tidak wajib untuk first paint, lalu pisahkan field tersebut ke alur completion dengan tracking token yang jelas dan definisi state terminal yang tegas. Instrumentasikan setiap transisi state di backend dan klien, lalu uji jalur gagal sejak awal karena regresi UX pada pola ini biasanya muncul dari ambiguitas state terminal, bukan dari jalur sukses.

## Referensi Otoritatif

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [MDN: 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202)
- [Atlassian: Designing APIs for asynchronous operations](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#asynchronous-operations)
- [Google: Material loading and progress indicators](https://m3.material.io/components/progress-indicators/overview)

## Kesimpulan

Respon parsial bukan trik framework, melainkan keputusan desain kontrak API. Dengan mengirim data yang siap lebih awal sambil memodelkan pekerjaan tertunda secara eksplisit, kami mendapat UX yang terasa lebih cepat tanpa berpura-pura dependensi lambat itu tidak ada. Payload mungkin terlihat kurang "murni," tetapi perjalanan pengguna menjadi jauh lebih baik dan lebih andal di production.
