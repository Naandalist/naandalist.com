---
title: "Respon API Parsial untuk UX yang Lebih Baik"
subtitle: "Utamakan UX, Kemurnian Belakangan"
description: "Pola praktis untuk mengembalikan respon API parsial sehingga pengguna melihat data nyata dengan cepat sementara data yang lambat diisi kemudian menggunakan track ID dan panggilan lanjutan, mengurangi waktu pemuatan yang dirasakan dan drop-off."
date: "2025-11-16"
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

## Ketika Data Sempurna Membunuh UX

Produk kami memiliki masalah yang sangat sederhana namun menyakitkan: halaman produk terlalu lambat.

Di atas kertas, backend _“berjalan lancar”_. Dibutuhkan sekitar lima detik bagi server untuk memproses permintaan dan mengirimkan respon penuh kembali ke klien. Pada kenyataannya, analitik menceritakan kisah yang berbeda: banyak pengguna menutup aplikasi setelah dua atau tiga detik menunggu. Penantian lima detik mungkin dapat diterima untuk unggahan file, tetapi untuk layar normal itu adalah UX yang buruk.

Setelah menggali sisi server, kami menemukan hambatan yang jelas. Sebagian besar kolom cepat diambil: nama, deskripsi, penjual, alamat, dan sebagainya. Satu hal yang secara konsisten memperlambat segalanya adalah harga.

API produk telah dirancang sebagai payload semua-atau-tidak-sama-sekali, jadi setiap permintaan menunggu ketergantungan yang paling lambat. Kolom harga menyandera seluruh respon.

## Dari Payload Sempurna ke Ketidaklengkapan yang Jujur

Pada titik tertentu pertanyaannya menjadi sangat langsung: apakah pengguna benar-benar membutuhkan setiap kolom untuk muncul pada waktu yang sama?

Analitik sudah menunjukkan bahwa jika tidak ada yang muncul dalam beberapa detik, pengguna menyerah begitu saja. Apa yang sebenarnya mereka butuhkan pertama kali adalah “identitas” produk: nama, gambar, dan info dasar. Harga pastinya penting, tetapi tidak harus menjadi hal pertama yang muncul di layar.

Ini membawa kami ke pola pikir yang berbeda. Alih-alih memaksa API untuk selalu mengembalikan payload yang “sempurna”, kami membiarkannya mengembalikan payload yang jujur namun tidak lengkap. Itu berarti mengirimkan semua data yang siap, dan secara eksplisit menandai bagian-bagian yang masih tertunda. Di sisi klien, UI merender apa pun yang tersedia segera, sambil menjaga status pemuatan hanya untuk bagian yang hilang.

Hasilnya adalah pengguna melihat produk nyata dengan cepat, alih-alih menatap spinner layar penuh yang menyembunyikan fakta bahwa 90% data sudah ada di sana.

## Bagaimana Cara Kerjanya

Dalam praktiknya, polanya sederhana.

Ketika klien memanggil _`/product`_, backend mencoba mengambil semua kolom dasar dan juga menghasilkan _`track_id`_ yang mewakili pencarian harga yang sedang berlangsung.

Jika semuanya siap, responnya hanyalah objek JSON normal dan lengkap. Jika harga masih diproses atau layanan harga hilir lambat, backend **tidak memblokir** seluruh respon. Ia mengembalikan sesuatu seperti ini:

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

- Produk ada dan semua kolom inti siap.
- track_id mengidentifikasi perhitungan harga ini di backend.
- price belum tersedia.
- priceComplete: false memberi tahu klien bahwa cerita belum berakhir.

Di sisi UI, klien:

- Merender produk segera menggunakan kolom yang sudah ada.
- Menampilkan kerangka atau status “memuat…” di area harga ketika priceComplete bernilai false.

Alih-alih memanggil /product lagi, klien sekarang menggunakan endpoint khusus untuk melengkapi bagian yang hilang. Setelah penundaan singkat, atau sesuai dengan beberapa kebijakan percobaan ulang, ia memanggil sesuatu seperti:

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

Backend mencari status harga menggunakan track_id (dan secara opsional productId). Respon masih bisa tidak lengkap:

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": false
}
```

Dalam hal itu, klien menjaga status pemuatan dan mencoba lagi getPrice setelah penundaan kecil lainnya. Ketika harga akhirnya siap, endpoint merespon dengan:

```json
{
  "track_id": "track-999",
  "price": 49.99,
  "priceComplete": true
}
```

Pada titik ini, UI mengganti kerangka dengan harga asli dan berhenti mencoba lagi. Detail pentingnya adalah bahwa:

| Endpoint    | Tanggung Jawab                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| `/product`  | Data cepat, parsial: semua kolom "identitas" + `track_id` + flag `priceComplete` |
| `/getPrice` | Mengubah "harga tertunda" menjadi "harga nyata" menggunakan `track_id`                    |

Setiap respon adalah objek JSON yang valid, dan klien selalu tahu persis bagian data mana yang masih dalam proses.

### Ketika Server Menyerah pada Harga

Ada satu kasus penting lagi: terkadang backend memutuskan untuk berhenti mencoba.

Dalam situasi yang jarang terjadi, layanan harga mungkin terus gagal atau time out berulang kali. Pada titik itu, backend dapat memutuskan untuk “menyerah” dan menandai pencarian harga sebagai selesai, meskipun tidak ada harga valid yang ditemukan. Respon dari getPrice kemudian terlihat seperti ini:

```json
{
  "track_id": "track-999",
  "price": null,
  "priceComplete": true
}
```

Secara semantik, ini berarti:

- Pipa harga selesai.
- Tidak ada harga yang dapat digunakan untuk produk ini.
- Percobaan ulang lebih lanjut tidak akan mengubah hasil.

Di sisi UI, status ini harus diperlakukan berbeda dari kasus “masih memuat”. Jika priceComplete bernilai true dan price masih null, kami tidak terus menampilkan kerangka dan kami tidak terus mencoba lagi.

Sebaliknya, perilaku paling sederhana dan paling aman dalam kasus kami adalah memfilter produk-produk ini dari daftar dan tidak menampilkannya sama sekali, karena kami tidak dapat menawarkan harga yang berarti kepada pengguna.

- Status ekstra ini membuat kontrak jujur di kedua arah:
- _"Masih memproses, harap tunggu"_ (priceComplete: false).
- _"Pemrosesan selesai, tidak ada harga"_ (priceComplete: true dengan price: null).

### Diagram Alur

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1763224832/naandalist.com/Untitled_diagram-2025-11-15-163928_ym4pao.svg" alt="Diagram Alur Respon Parsial" />
  <p style="font-size: 0.875rem;"><em>Diagram alur yang menunjukkan pola respon parsial</em></p>
</div>

### Kesimpulan: Utamakan UX, Kemurnian Belakangan

Respon parsial bukanlah protokol mewah atau fitur kerangka kerja baru. Mereka adalah pergeseran kecil dalam cara kita berpikir tentang respon API: alih-alih berpura-pura bahwa data itu “lengkap” atau “tidak siap sama sekali,” kita mengakui bahwa beberapa kolom dapat tiba kemudian.

Dengan membiarkan server mengembalikan apa yang siap dan menandai dengan jelas apa yang masih tertunda, kami mengurangi waktu pemuatan yang dirasakan tanpa menyentuh trik jaringan tingkat rendah atau streaming.

Bentuk JSON menjadi sedikit kurang “murni,” tetapi UX menjadi jauh lebih baik. Pada akhirnya, pertukaran itulah yang menjaga pola ini berjalan dengan aman dalam produksi selama bertahun-tahun.
