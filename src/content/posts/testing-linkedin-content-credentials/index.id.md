---
title: "Menguji Cara LinkedIn Mendeteksi Content Credentials"
subtitle: "Eksperimen kecil tentang metadata C2PA dan badge Content Credentials di LinkedIn"
description: "Eksperimen langsung untuk memahami cara LinkedIn menampilkan C2PA Content Credentials dan apa yang terjadi setelah metadata gambar dihapus."
date: "2026-08-16T00:00:00Z"
draft: false
featured: true
keywords:
  ["content credentials", "c2pa", "linkedin", "gambar buatan AI", "metadata"]
lang: "id"
---

![Badge Kecil yang Memulai Eksperimen Ini](https://res.cloudinary.com/naandalistcloud/image/upload/v1786886817/naandalist.com/center_by_duskstormcrow_dmkqp2o-pre_biij2y.jpg)

> Badge Kecil yang Memulai Eksperimen Ini

## Badge Kecil yang Memulai Eksperimen Ini

Beberapa waktu lalu, saya memublikasikan gambar buatan AI dalam sebuah postingan LinkedIn. Setelah gambar diunggah, saya melihat **badge CR** kecil di sampingnya.

Saat kursor diarahkan ke badge tersebut, LinkedIn menampilkan panel Content Credentials. Panel itu menjelaskan bahwa AI digunakan untuk menghasilkan gambar, menyebut **OpenAI Media Services API** sebagai aplikasi atau perangkat yang digunakan, mencantumkan **OpenAI OpCo, LLC** sebagai penerbit, serta menampilkan tanggal penerbitan credential.

Temuan itu memunculkan pertanyaan sederhana: bagaimana LinkedIn mengetahuinya?

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1786937946/linkedin-post-with-cr-badge_b9cb0y.webp" alt="Screenshot postingan LinkedIn yang menampilkan badge CR" />
  <p style="font-size: 0.875rem;"><em>Postingan LinkedIn yang menampilkan badge CR</em></p>
</div>

## Content Credentials Bukan Detektor AI

Sebelum masuk ke eksperimen, ada satu perbedaan penting. Content Credentials bukan hasil LinkedIn memeriksa tampilan gambar lalu menyimpulkan bahwa gambar tersebut terlihat seperti buatan AI.

LinkedIn menggunakan [standar C2PA](https://www.linkedin.com/help/linkedin/answer/a6282984) untuk membaca informasi provenance yang melekat pada gambar dan video yang didukung. Credential dapat menjelaskan asal media, tool yang membuat atau mengeditnya, serta pihak yang menandatangani pernyataan tersebut.

Tanda tangan digital membuat klaim provenance itu dapat diverifikasi. Namun, credential tidak membuktikan bahwa setiap detail dalam gambar pasti benar. Tidak adanya credential juga bukan bukti bahwa sebuah gambar dibuat tanpa AI.

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1786938168/linkedin_post_with_cr_badge_expanded_popzos.webp" alt="Screenshot panel Content Credentials yang diperluas" />
  <p style="font-size: 0.875rem;"><em>Panel Content Credentials yang menampilkan detail provenance gambar</em></p>
</div>

## Pertanyaan yang Saya Uji

Saya ingin menguji satu pertanyaan yang spesifik:

> Apakah LinkedIn tetap menampilkan badge Content Credentials setelah data provenance yang melekat pada gambar dihapus?

Eksperimen ini hanya mengamati badge yang terlihat. Saya tidak mencoba mengevaluasi semua sistem keamanan, moderasi, atau klasifikasi AI yang mungkin digunakan LinkedIn di balik layar.

## Memeriksa Gambar Asli

Pertama, saya memeriksa file asli memakai tool metadata seperti [ExifTool](https://exiftool.org/) dan [metadata viewer dari Metadata2Go](https://www.metadata2go.com/view-metadata).

Beberapa nilai yang terlihat adalah:

```text
actions_software_agent_name: gpt-image
actions_software_agent_version: 2
actions_digital_source_type: trainedAlgorithmicMedia
c2pa_certificate-status: ...
```

Nilai `trainedAlgorithmicMedia` menjadi petunjuk paling jelas. Nilai ini mendeskripsikan media yang dibuat menggunakan algoritma terlatih, sedangkan field terkait C2PA menunjukkan bahwa file membawa informasi provenance yang ditandatangani.

Informasi tersebut juga selaras dengan detail yang ditampilkan LinkedIn di panel Content Credentials. Dari sini saya mendapatkan baseline: file asli menyimpan informasi yang dapat dibaca dan ditampilkan oleh LinkedIn.

## Menghapus Metadata

Berikutnya, saya memproses salinan gambar menggunakan [metadata remover dari Metadata2Go](https://www.metadata2go.com/delete-metadata). File asli tetap saya simpan tanpa perubahan. Hanya hasil pemrosesan yang digunakan untuk pengujian kedua.

Setelah proses selesai, saya memeriksa kembali file tersebut. Nilai metadata yang sebelumnya terlihat pada gambar asli sudah tidak ditemukan.

Kemudian saya mengunggah salinan itu ke LinkedIn.

## Hasilnya

Gambar tetap berhasil diunggah dan ditampilkan seperti biasa, tetapi **badge CR tidak lagi muncul**.

Dalam pengujian ini, penghapusan metadata ikut menghilangkan sinyal provenance yang sebelumnya digunakan LinkedIn untuk menampilkan antarmuka Content Credentials.

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1786938435/naandalist.com/Screenshot_2026-08-17_at_10.46.51_eudxby.png" alt="Perbandingan unggahan LinkedIn sebelum dan sesudah metadata dihapus" />
  <p style="font-size: 0.875rem;"><em>Perbandingan unggahan sebelum dan sesudah metadata dihapus</em></p>
</div>

## Apa yang Terbukti dan Tidak Terbukti

Hasil eksperimen ini mendukung kesimpulan yang terbatas:

> Pada gambar dan alur unggah yang saya uji, LinkedIn menampilkan badge ketika C2PA Content Credentials dapat dibaca, lalu berhenti menampilkannya setelah credential tersebut dihapus.

Hasil ini **tidak** membuktikan bahwa saya berhasil melewati semua bentuk deteksi AI di LinkedIn. LinkedIn sendiri menjelaskan bahwa mereka belum dapat mengidentifikasi dan memberi label pada seluruh konten yang dibuat atau dimodifikasi dengan AI. Platform tersebut juga mungkin memakai sistem keamanan atau moderasi lain yang tidak berhubungan dengan badge.

Gambar hasil pemrosesan juga tidak berubah menjadi gambar non-AI. Hanya jejak provenance yang terlihat yang menghilang.

## Mengapa Temuan Ini Penting

Content Credentials memberi transparansi yang berguna. Namun, eksperimen ini menunjukkan keterbatasan penting dari provenance yang melekat pada file: metadata dapat hilang ketika file dibersihkan, dikodekan ulang, atau diproses oleh tool yang tidak mempertahankannya.

[Spesifikasi C2PA](https://spec.c2pa.org/specifications/specifications/2.4/specs/ContentCredentials.html) mengakui bahwa sebuah aset dapat terpisah dari manifest-nya ketika metadata dihapus atau rusak. Pendekatan yang lebih tahan lama dapat memakai mekanisme pemulihan eksternal, tetapi platform tetap harus mendukung dan menemukan kembali credential tersebut.

Ada tiga pelajaran praktis dari eksperimen ini:

- **Bagi pembaca:** tidak adanya badge bukan berarti AI tidak digunakan.
- **Bagi kreator:** simpan file asli yang ditandatangani jika provenance penting, lalu periksa apakah tool editing atau platform publikasi mempertahankan credential-nya.
- **Bagi platform:** credential yang melekat pada file sangat berguna, tetapi mengandalkannya sebagai satu-satunya sinyal meninggalkan celah ketika data provenance dihapus.

## Keterbatasan Eksperimen

Ini adalah eksperimen kecil, bukan benchmark menyeluruh. Saya hanya menguji satu gambar, satu alur penghapusan metadata, dan satu jalur unggah LinkedIn. Saya belum menguji format gambar lain, aplikasi editing berbeda, invisible watermark, pemulihan credential berbasis cloud, atau unggahan berulang dari akun yang berbeda.

LinkedIn juga merilis fitur Content Credentials secara bertahap. Perilakunya dapat berubah seiring waktu.

## Kesimpulan

LinkedIn tidak perlu menebak bahwa gambar asli saya dibuat menggunakan AI. Platform tersebut membaca klaim provenance yang sudah melekat dan ditandatangani pada file, lalu menyajikannya melalui badge Content Credentials.

Setelah data itu saya hapus, badge ikut menghilang. Makna dan asal gambar tidak berubah; hanya konteks terverifikasi yang ikut tersimpan bersama file yang hilang.

Itulah temuan terpenting dari eksperimen ini: Content Credentials dapat membuat riwayat media terlihat, tetapi credential yang tidak ditemukan tidak boleh dianggap sebagai bukti bahwa riwayat tersebut tidak ada.
