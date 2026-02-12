---
title: "Respon API Parsial untuk UX yang Lebih Baik"
subtitle: "Utamakan Pengalaman Pengguna, Kesempurnaan Data Nomor Dua"
description: "Pola praktis mengembalikan respon API secara parsial agar pengguna melihat data utama cepat, sementara data lambat dimuat belakangan mengurangi pengguna kabur."
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

## Ketika Data yang "Sempurna" Justru Membunuh UX

Produk kami punya masalah yang sangat sederhana tapi menyakitkan: halaman produknya lemot minta ampun.

Di atas kertas, backend-nya sih _"jalan"_. Butuh waktu sekitar lima detik bagi server untuk memproses permintaan dan mengirimkan respon lengkap kembali ke klien. Tapi kenyataannya, data analitik menceritakan kisah yang berbeda: banyak pengguna menutup aplikasi setelah menunggu dua atau tiga detik. Menunggu lima detik mungkin wajar untuk upload file, tapi untuk membuka layar biasa, itu UX yang buruk.

Setelah menggali sisi server, kami menemukan biang keroknya. Sebagian besar data bisa diambil dengan cepat: nama, deskripsi, penjual, alamat, dan sebagainya. Satu hal yang konsisten memperlambat segalanya adalah **harga**.

API produk ini dirancang dengan prinsip "semua-atau-tidak-sama-sekali" (_all-or-nothing_), jadi setiap permintaan harus menunggu komponen yang paling lambat. Kolom harga menyandera seluruh respon API.

## Dari Payload Sempurna ke Ketidaklengkapan yang Jujur

Pada titik tertentu, pertanyaannya menjadi sangat mendasar: apakah pengguna benar-benar butuh _setiap_ kolom data muncul di detik yang sama?

Analitik sudah menunjukkan bahwa jika tidak ada yang muncul dalam beberapa detik, pengguna akan menyerah dan pergi. Apa yang sebenarnya mereka butuhkan pertama kali adalah "identitas" produk: nama, gambar, dan info dasar. Harga memang penting, tapi tidak harus menjadi hal _pertama_ yang muncul di layar.

Ini membawa kami ke pola pikir yang berbeda. Alih-alih memaksa API untuk selalu mengembalikan payload yang "sempurna", kami membiarkannya mengembalikan payload yang jujur meski tidak lengkap. Artinya: kirimkan semua data yang sudah siap, dan tandai secara eksplisit bagian mana yang masih tertunda. Di sisi klien (aplikasi), UI langsung merender apa pun yang tersedia, sambil menjaga status _loading_ hanya untuk bagian yang belum ada.

Hasilnya? Pengguna melihat produk nyata dengan cepat, daripada harus menatap _spinner_ layar penuh yang menyembunyikan fakta bahwa 90% data sebenarnya sudah siap.

## Cara Kerjanya

Dalam praktiknya, polanya sederhana.

Ketika klien memanggil `/product`, backend mencoba mengambil semua kolom dasar dan juga menghasilkan sebuah `track_id` yang mewakili proses pencarian harga yang sedang berjalan di latar belakang.

Jika semuanya siap, responnya hanyalah objek JSON normal yang lengkap. Tapi jika harga masih diproses atau layanan harga (pricing service) sedang lambat, backend **tidak memblokir** seluruh respon. Ia mengembalikan data seperti ini:

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

Maknanya jelas:

- Produk ada dan semua data inti sudah siap.
- `track_id` adalah identitas untuk proses perhitungan harga di backend.
- `price` belum tersedia (null).
- `priceComplete: false` memberi tahu klien bahwa urusan ini belum selesai.

Di sisi UI, klien:

- Langsung merender produk menggunakan data yang sudah ada.
- Menampilkan _skeleton_ atau status "memuat..." khusus di area harga karena `priceComplete` bernilai `false`.

Alih-alih memanggil `/product` lagi (yang berat), klien sekarang menggunakan endpoint khusus yang ringan untuk melengkapi bagian yang hilang. Setelah jeda singkat, atau sesuai kebijakan _retry_, klien memanggil:

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

Backend mengecek status harga menggunakan `track_id` (dan opsional `productId`). Responnya masih bisa belum lengkap:

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": false
}
```

Dalam kasus itu, klien tetap menahan status _loading_ dan mencoba `getPrice` lagi setelah jeda singkat. Ketika harga akhirnya siap, endpoint merespon dengan:

```json
{
  "track_id": "track-999",
  "price": 49.99,
  "priceComplete": true
}
```

Pada titik ini, UI mengganti _skeleton_ dengan harga asli dan berhenti melakukan _retry_. Detail pentingnya adalah:

| Endpoint    | Tanggung Jawab                                                                   |
| ----------- | -------------------------------------------------------------------------------- |
| `/product`  | Data cepat, parsial: semua kolom "identitas" + `track_id` + flag `priceComplete` |
| `/getPrice` | Mengubah "harga tertunda" menjadi "harga nyata" menggunakan `track_id`           |

Setiap respon adalah objek JSON yang valid, dan klien selalu tahu persis bagian data mana yang masih dalam proses.

### Ketika Server Menyerah Mencari Harga

Ada satu kasus penting lagi: terkadang backend memutuskan untuk berhenti mencoba.

Dalam situasi yang jarang terjadi, layanan harga mungkin terus gagal atau _time out_ berulang kali. Pada titik itu, backend dapat memutuskan untuk "menyerah" dan menandai pencarian harga sebagai selesai, meskipun tidak ada harga valid yang ditemukan. Respon dari `getPrice` kemudian terlihat seperti ini:

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": true
}
```

Secara semantik, ini berarti:

- Proses pencarian harga sudah selesai.
- Tidak ada harga yang bisa digunakan untuk produk ini.
- Mencoba lagi (_retry_) tidak akan mengubah hasil.

Di sisi UI, status ini harus diperlakukan berbeda dari kasus "masih memuat". Jika `priceComplete` bernilai `true` tapi `price` masih `null`, kita tidak boleh terus menampilkan _skeleton_ dan tidak boleh terus mencoba lagi.

Sebaliknya, perilaku paling sederhana dan paling aman dalam kasus kami adalah memfilter produk-produk ini dari daftar dan tidak menampilkannya sama sekali, karena kami tidak dapat menawarkan harga yang valid kepada pengguna.

Status ekstra ini membuat kontrak menjadi jujur di kedua arah:

- _"Masih memproses, harap tunggu"_ (`priceComplete: false`).
- _"Pemrosesan selesai, tidak ada harga"_ (`priceComplete: true` dengan `price: null`).

### Diagram Alur

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1763224832/naandalist.com/Untitled_diagram-2025-11-15-163928_ym4pao.svg" alt="Diagram Alur Respon Parsial" />
  <p style="font-size: 0.875rem;"><em>Diagram alur yang menunjukkan pola respon parsial</em></p>
</div>

### Kesimpulan: Utamakan UX, Kerapian Data Belakangan

Respon parsial bukanlah protokol mewah atau fitur framework baru. Ini hanyalah pergeseran kecil dalam cara kita berpikir tentang respon API: alih-alih berpura-pura bahwa data itu harus selalu "lengkap" atau "tidak siap sama sekali," kita mengakui bahwa beberapa kolom data boleh datang terlambat.

Dengan membiarkan server mengembalikan apa yang sudah siap dan menandai dengan jelas apa yang masih tertunda, kami mengurangi waktu tunggu yang dirasakan pengguna (_perceived loading time_) tanpa perlu menyentuh trik jaringan tingkat rendah atau _streaming_.

Bentuk JSON-nya mungkin jadi sedikit kurang "rapi" atau "murni", tapi UX-nya jadi jauh lebih baik. Pada akhirnya, pertukaran itulah yang membuat pola ini bisa berjalan aman di _production_ selama bertahun-tahun.
