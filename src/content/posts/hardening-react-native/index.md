---
title: "Hardening React Native Against Frida"
description: "JailMonkey bypass in practice"
date: "Nov 13 2025"
---

_Hook detection is trivial to bypass. Treat Frida as a given. Enforce on the backend with hardware-backed attestation, pin TLS in native, use nonces and replay defenses, and treat client checks as telemetry only._

### Threat Model (1-page)

**Attacker can:** run Frida/Objection/Magisk, hook Java/JSI/C++, patch memory, MITM without proper pinning, replay or forge requests if the server is naive.  
**You protect:** account takeover, payment abuse, replay of privileged calls, scraping, feature gate bypass, API key theft.

---

## Bypass demo: JailMonkey

**Goal:** show that client booleans from [`jail-monkey`](https://www.npmjs.com/package/jail-monkey) are trivial to falsify with Frida and must not be used as gates.

### Baseline check (JS)

```ts
import JailMonkey from "jail-monkey";

export async function deviceRiskSignal() {
  return {
    isJailBroken: JailMonkey.isJailBroken(),
    canMockLocation: JailMonkey.canMockLocation(),
    isOnExternalStorage: JailMonkey.isOnExternalStorage(),
    adbEnabled: JailMonkey.adbEnabled(),
    isDebuggedMode: await JailMonkey.isDebuggedMode?.(),
  };
}
// Treat these as telemetry only, not access control.
```

## Attacker bypass (Frida, minimal)

```java
// bypass-jailmonkey.js
Java.perform(() => {
  const Mod = Java.use('com.gantix.JailMonkey.JailMonkeyModule');

  // Option 1: override the constants map
  Mod.getConstants.implementation = function () {
    const m = this.getConstants();
    m.put('isJailBroken', false);
    m.put('canMockLocation', false);
    m.put('isOnExternalStorage', false);
    m.put('adbEnabled', false);
    m.put('isDebuggedMode', false);
    return m;
  };

  // Option 2: override individual methods
  ['isJailBroken','canMockLocation','isOnExternalStorage','adbEnabled','isDebuggedMode']
    .forEach(name => { if (Mod[name]) Mod[name].implementation = function () { return false; }; });

  console.log('JailMonkey checks forced to false');
});

```

## Run

```bash
# Device: rooted/emulator with Frida server
frida -U -f com.your.appid -l bypass-jailmonkey.js --no-pause
```

Result: every JailMonkey signal flips to “safe.” Public full bypass:
https://codeshare.frida.re/@RohindhR/react-native-jail-monkey-bypass-all-checks/

## Real defenses (raise cost measurably)

1. Server-verified device attestation

Android: Play Integrity API; prefer Strong/Hardware verdict. Verify on your server. Use a nonce that encodes user, session, action, timestamp.

iOS: App Attest (DeviceCheck fallback). Same challenge/response pattern.

Server verify sketch (Node)

```js
// Pseudocode outline
// 1) Verify JWS signature from Google/Apple
// 2) Check nonce == expected, within TTL
// 3) Enforce verdict quality (e.g., MEETS_STRONG_INTEGRITY)
// 4) Bind to user/session/IP; authorize only on success
```

2. Native TLS certificate pinning

Pin leaf or intermediate in OkHttp and NSURLSession. Rotate with overlap windows.

OkHttp pinning

```kotlin
import okhttp3.CertificatePinner
import okhttp3.OkHttpClient

private fun secureClient(): OkHttpClient {
    val pinner = CertificatePinner.Builder()
        .add("api.yourdomain.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
        .build()
    return OkHttpClient.Builder().certificatePinner(pinner).build()
}
```

## Red-team drill (quick evaluation)

1. Run app on rooted Pixel + Magisk + Frida.
2. Hook JailMonkey checks to false; confirm app doesn’t grant new privileges without server attestation.
3. Attempt MITM with custom CA; confirm pinning blocks.
4. Replay a privileged request sans fresh nonce; expect 401.
5. Skip attestation call; expect server rejection.
6. Rotate pins; confirm overlap works.
7. Disable OTA; confirm old malicious bundle can’t load.
