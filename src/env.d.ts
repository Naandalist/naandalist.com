/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  shakeElement?: (el: HTMLElement) => void;
}
