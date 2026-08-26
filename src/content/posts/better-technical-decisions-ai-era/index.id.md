---
title: "Keputusan Engineering yang Lebih Baik di Era AI"
subtitle: "Keputusan teknis yang tepat lebih penting daripada menghasilkan lebih banyak kode."
description: "Mengapa judgment, batasan proyek, verifikasi, dan maintainability lebih penting daripada kecepatan coding atau mengejar teknologi baru di era AI."
date: "2026-08-26"
draft: false
featured: false
lang: "id"
keywords:
  - engineering judgment
  - keputusan teknis
  - AI coding
  - arsitektur software
  - tradeoff teknologi
---

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1787754947/naandalist.com/primordial_golem_by_oasidd_dmp76wv-pre_anfm32.jpg" alt="Better Engineering Decisions in the AI Era" />
</div>

AI dapat menghasilkan kode lebih cepat dari sebelumnya. Namun, itu tidak berarti kita dapat menyelesaikan produk yang tepat dengan lebih cepat.

Posisi bottleneck telah bergeser.

Menulis kode menjadi semakin murah. Memastikan bahwa kita menulis kode yang tepat, menggunakan teknologi yang tepat, dan menyesuaikannya dengan batasan yang ada tetaplah sulit. Di era AI, skill engineering paling berharga bukan mengetik lebih cepat. Skill itu adalah membuat keputusan teknis yang lebih baik.

## Setiap Keputusan Bergantung pada Situasi

Tidak ada pilihan teknologi yang selalu benar untuk semua keadaan.

Proyek dengan anggaran terbatas membutuhkan keputusan yang berbeda dari proyek dengan sumber daya melimpah. Tim kecil yang mengejar deadline memiliki batasan berbeda dari tim besar yang membangun infrastruktur untuk jutaan pengguna.

Tujuan kita bukan menggunakan teknologi paling canggih. Tujuannya adalah menyelesaikan proyek sesuai jadwal, menjaga biaya tetap sesuai anggaran, dan memenuhi requirement.

Hal ini mungkin terdengar jelas. Namun, engineer sering melupakannya ketika framework baru mulai populer.

## FOMO Bukan Requirement Teknis

Ketika orang-orang mulai membicarakan Lynx, saya memahami antusiasme mereka. Framework baru dapat membawa ide yang berguna dan mendorong ekosistem berkembang. Namun, saya tetap memilih React Native untuk proyek baru.

Saya sudah mengenal React Native. Saya memahami kelebihan, keterbatasan, tooling, dan berbagai failure mode-nya. Ekosistemnya cukup matang untuk proyek yang perlu saya selesaikan. Menggantikan pengalaman tersebut dengan framework baru akan membawa risiko yang sebenarnya tidak dibutuhkan oleh proyek.

Menjadi early adopter tidak otomatis salah. Itu adalah sebuah tradeoff. Early adopter mendapatkan akses lebih cepat terhadap kemampuan baru, tetapi mereka juga menerima dokumentasi yang belum matang, ekosistem yang lebih kecil, API yang belum stabil, perilaku di production yang belum banyak diketahui, dan maintenance yang lebih sulit.

Jika proyek mendapatkan manfaat yang sepadan, risiko tersebut mungkin layak diambil. Jika tidak, mengadopsi teknologi baru hanya karena semua orang sedang membicarakannya bukanlah inovasi. Itu adalah FOMO yang menyamar sebagai keputusan arsitektur.

## Penguasaan Teknologi Matang Tetap Berharga

Mindset ini juga membuat saya menghargai orang-orang yang masih membangun aplikasi menggunakan PHP dan Laravel.

Sebagian engineer menganggap penggunaan teknologi lama atau familiar sebagai tanda bahwa sebuah tim berhenti belajar. Saya melihatnya secara berbeda. Jika sebuah tim menguasai Laravel, mampu melakukan delivery dengan andal, dan dapat memelihara hasilnya selama bertahun-tahun, penguasaan tersebut adalah keunggulan engineering.

Stack yang teruji di tangan orang berpengalaman dapat menjadi pilihan lebih baik daripada stack yang sedang populer di tangan orang yang belum menguasainya.

Teknologi tidak perlu terlihat mengesankan. Teknologi perlu menyelesaikan masalah. Pemahaman mendalam terhadap tool yang matang sering kali mengurangi waktu delivery, kejutan saat operasional, dan biaya maintenance. Hasil tersebut lebih penting daripada apakah stack kita terlihat modern di media sosial.

## AI Mempercepat Rewrite, Bukan Otomatis Membuatnya Aman

Rewrite Bun dari Zig ke Rust memberikan contoh yang menarik. AI membantu membuat rewrite tersebut selesai dengan kecepatan yang sulit dicapai melalui proses tradisional. Pencapaian itu mengesankan.

Namun, menghasilkan kode hanyalah salah satu bagian dari pekerjaan.

Tim Bun tetap membutuhkan strategi porting yang jelas, trial run, test suite besar yang tidak bergantung pada bahasa implementasi, adversarial review, verifikasi berkelanjutan, dan pemeriksaan manual. Kode yang dihasilkan tidak otomatis dapat dipercaya hanya karena berhasil di-compile atau dibuat dengan cepat.

Inilah tradeoff yang penting. AI dapat mengurangi biaya untuk menghasilkan kode, termasuk untuk rewrite berskala sangat besar. AI tidak menghilangkan biaya untuk membuktikan bahwa sistem baru bekerja dengan benar. AI juga tidak menjawab apakah tim mampu mengoperasikan dan memelihara sistem tersebut dalam jangka panjang.

Semakin cepat kita menghasilkan kode, semakin penting proses verifikasi.

## Peran Engineer Bergerak ke Hulu

AI mengubah bentuk leverage dalam engineering.

Ketika implementasi menjadi lebih cepat, nilai yang lebih besar berpindah ke proses merumuskan masalah, memahami batasan, memilih tradeoff, menentukan acceptance criteria, dan meninjau hasil. Tanggung jawab ini bukan sekadar pelengkap dari coding. Semua itu menentukan apakah sebuah kode memang perlu dibuat sejak awal.

Sebelum memilih teknologi, saya kembali kepada tiga pertanyaan:

1. Apakah teknologi ini memenuhi requirement proyek?
2. Apakah tim dapat melakukan delivery sesuai anggaran dan jadwal yang tersedia?
3. Apakah tim dapat menguji, mengoperasikan, dan memeliharanya dalam jangka panjang?

Pertanyaan tersebut sederhana, tetapi dapat membongkar keputusan yang lemah dengan cepat.

Sebuah teknologi mungkin unggul dalam benchmark, tetapi gagal pada pertanyaan kedua karena tim membutuhkan waktu berbulan-bulan untuk mempelajarinya. Teknologi lain mungkin mempercepat rilis pertama, tetapi gagal pada pertanyaan ketiga karena ekosistemnya belum stabil. Framework yang familiar mungkin tidak menarik perhatian, tetapi tetap dapat menjadi jawaban terbaik untuk ketiga pertanyaan tersebut.

## Keputusan yang Lebih Baik Mengalahkan Kode yang Lebih Banyak

Kecepatan coding tetap penting. AI adalah tool luar biasa untuk meningkatkannya. Namun, kecepatan hanya bernilai jika membawa proyek ke arah yang benar.

Engineering bukan kompetisi untuk menggunakan framework terbaru atau menghasilkan kode terbanyak. Engineering adalah praktik menghadirkan sistem yang memenuhi kebutuhan nyata di bawah batasan yang nyata.

Terkadang keputusan yang tepat adalah React Native, bukan framework baru. Terkadang Laravel, bukan backend yang lebih populer. Terkadang keputusan itu berupa rewrite besar dengan bantuan AI, didukung testing dan review yang cukup untuk membuat risikonya layak diambil.

Kontekslah yang menentukan.

Engineer terkuat di era AI bukan orang yang menghasilkan kode paling cepat. Ia adalah orang yang memahami apa yang harus dibangun, mengapa harus dibangun dengan cara tersebut, dan tradeoff mana yang sanggup ditanggung oleh proyek.

## Referensi

- [Rewriting Bun in Rust](https://bun.com/blog/bun-in-rust)
