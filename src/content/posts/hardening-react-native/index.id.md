---
title: "Pengerasan Aplikasi React Native Melampaui JailMonkey"
subtitle: "Mengapa pemeriksaan root bukan keamanan yang sebenarnya"
description: "Mengapa pemeriksaan root dan hook di React Native adalah kontrol yang lemah, dan mengapa keputusan keamanan harus berada di backend, bukan di dalam aplikasi."
date: "2025-11-14"
lang: "id"
keywords:
  - React Native security
  - mobile app hardening
  - device attestation
  - TLS pinning
  - Play Integrity API
  - App Attest
  - Frida detection
  - root detection
  - jailbreak detection
  - mobile security patterns
  - replay protection
  - MITM prevention
  - certificate pinning
  - backend security
  - client trust
---

![Neon Skies and Chrome Dreams](https://res.cloudinary.com/naandalistcloud/image/upload/v1763258345/naandalist.com/the_codex_of_eternal_flame_by_ai_agent_zero_djxveks-fullview_sjwcij.jpg)

Sebagian besar aplikasi React Native yang "melakukan keamanan" dimulai dengan cara yang sama: instal library seperti [jail-monkey](https://www.npmjs.com/package/jail-monkey), baca beberapa boolean, blokir pengguna jika perangkat terlihat berisiko.

Rasanya seperti perlindungan. Dalam praktiknya, ini hanyalah logging yang dimuliakan. Penyerang yang bertekad dengan [Frida](https://github.com/frida/frida/releases), [Magisk](https://github.com/topjohnwu/Magisk), atau APK yang ditambal dapat membalik boolean tersebut ke nilai apa pun yang mereka inginkan. Jika logika bisnis Anda mempercayai mereka, Anda kalah.

Tulisan ini memperlakukan klien sebagai musuh dan menjelaskan mengapa deteksi root dan hook adalah kontrol yang lemah dalam lingkungan itu.

## Mulai dengan model ancaman

React Native berjalan di dalam proses yang sepenuhnya dikontrol oleh pengguna. Penyerang yang sebenarnya dapat:

<div align="center">
  <img src="https://res.cloudinary.com/naandalistcloud/image/upload/v1763260385/naandalist.com/Untitled_diagram-2025-11-16-023147_t9wdfs.svg" alt="attacking Flow Diagram" style="width: 50%;" />
  <p style="font-size: 0.875rem;"><em>Diagram alur yang menunjukkan bagaimana penyerang mengontrol aplikasi</em></p>
</div>

Jika Anda tidak mengasumsikan itu, Anda tidak melakukan pekerjaan keamanan, Anda melakukan teater.

Dari titik itu, beberapa hal harus tidak dapat dinegosiasikan:

- Flag apa pun seperti **isRooted**, **isHooked**, **isDebugged** hanyalah data di dalam proses yang tidak dipercaya
- Kondisional apa pun di JavaScript yang mengatur uang atau hak istimewa dapat dilewati atau ditulis ulang
- Aset sebenarnya ada di backend: akun, pembayaran, promo, tindakan istimewa, API

## Mengapa pemeriksaan sisi klien tidak otoritatif

Pola tipikal: instal `jail-monkey`, kumpulkan objek risiko, bercabang padanya.

```ts
import JailMonkey from "jail-monkey";

export function getDeviceRiskSignal() {
  return {
    isJailBroken: JailMonkey.isJailBroken(),
    isDebuggedMode: JailMonkey.isDebuggedMode(),
    canMockLocation: JailMonkey.canMockLocation(),
    isOnExternalStorage: JailMonkey.isOnExternalStorage(),
    hookDetected: JailMonkey.hookDetected(),
  };
}
```

Di tempat lain:

```ts
const risk = getDeviceRiskSignal();

if (risk.isJailBroken || risk.hookDetected || risk.isDebuggedMode) {
  // Blokir login, pembayaran, atau tampilkan peringatan
}
```

Di perangkat normal ini "berfungsi." Di perangkat yang bermusuhan ini hanyalah API yang dikontrol penyerang.

Hook Frida sederhana di Android:

```java
Java.perform(function () {
  const JailMonkey = Java.use("com.gantix.JailMonkey.JailMonkeyModule");

  JailMonkey.getConstants.implementation = function () {
    const original = this.getConstants();
    original.put("isJailBroken", false);
    original.put("isDebuggedMode", false);
    original.put("canMockLocation", false);
    original.put("isOnExternalStorage", false);
    original.put("hookDetected", false);
    return original;
  };
});
```

Untuk detail lebih lanjut contoh Frida melewati semua pemeriksaan, lihat [script](https://codeshare.frida.re/@RohindhR/react-native-jail-monkey-bypass-all-checks/) ini

Jalankan ini di aplikasi dan setiap panggilan ke JailMonkey berbohong demi penyerang. Aplikasi percaya perangkat bersih sementara sepenuhnya diinstrumentasi.

Apa pun yang dihitung murni di perangkat klien adalah input yang tidak dipercaya. Ini dapat berguna sebagai sinyal, tetapi tidak pernah sebagai otoritas akhir untuk tindakan bernilai tinggi.

## Pindahkan penegakan ke backend

Jika klien tidak dapat dipercaya, penegakan pindah ke backend. Pemeriksaan klien berhenti menjadi hakim dan menjadi petunjuk.

Untuk alur berisiko tinggi, backend harus menjawab tiga pertanyaan sebelum menyetujui sesuatu yang penting:

1. Perangkat dan instance aplikasi apa yang diklaim oleh permintaan ini
2. Apakah saluran jaringan cukup terlindungi dari intersepsi dan gangguan
3. Apakah permintaan spesifik ini sudah digunakan sebelumnya

Itu dipetakan ke tiga area luas:

1. Sinyal integritas perangkat dan aplikasi yang sulit dipalsukan
2. Konfigurasi transport yang kuat
3. Desain permintaan yang menolak replay

Detailnya berbeda berdasarkan platform dan stack, tetapi arahnya selalu sama. Server memutuskan berdasarkan bukti yang diverifikasi server, bukan pada boolean yang dilaporkan klien.

## Pemeriksaan kewarasan red team

Tes mandiri cepat lebih jujur daripada slide deck apa pun.

Ambil build produksi Anda dan:

1. Instal di perangkat atau emulator yang di-root atau di-jailbreak
2. Lampirkan Frida dan paksa semua flag "risiko" Anda ke nilai aman
3. Coba selesaikan login, alur uang, dan alur voucher

Jika semuanya masih berfungsi seperti biasa, maka backend Anda tidak menegakkan apa pun yang penting selain "klien mengatakan itu aman."

Selanjutnya, simulasikan pengaturan MITM dasar dengan alat proxy seperti [Burp Suite](https://portswigger.net/burp/documentation/desktop/mobile/config-android-device):

1. Instal sertifikat root kustom di perangkat
2. Proxy traffic dan lihat apakah Anda dapat membaca dan mengedit permintaan HTTPS dari aplikasi Anda

Jika traffic sepenuhnya terlihat dan dapat dimodifikasi, keamanan transport lemah dan intersepsi sepele.

Akhirnya:

1. Tangkap satu permintaan istimewa yang berhasil
2. Replay tanpa melalui UI normal

Jika backend menerimanya lagi, Anda tidak memiliki perlindungan replay yang efektif. Siapa pun yang dapat menangkap satu permintaan valid dapat mengulanginya.

## Kesimpulan

Tulisan ini berpendapat untuk berhenti mempercayai klien dan berhenti membiarkannya memutuskan apa yang aman. Pemeriksaan root, pemeriksaan hook, dan library serupa dapat tetap ada, tetapi hanya sebagai sensor berisik yang memberi makan backend, bukan sebagai gerbang di sekitar uang atau hak istimewa.

Pekerjaan sebenarnya ada di sisi server: verifikasi integritas perangkat dan aplikasi dengan attestation, lindungi transport dengan TLS pinning, dan rancang alur sensitif di sekitar perlindungan replay berbasis nonce sehingga permintaan yang ditangkap tidak dapat digunakan kembali.

Tidak ada sistem yang sempurna aman, tetapi tumpukan kontrol ini membuat serangan lebih berisik, lebih kompleks, dan jauh lebih mahal daripada membalik beberapa boolean di klien yang di-hook.
