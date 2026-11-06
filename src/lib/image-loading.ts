const SELECTOR = 'img.image-blur-load'

function markLoaded(img: HTMLImageElement) {
  img.classList.add('loaded')
  img.closest('.image-loading-shimmer')?.classList.add('loaded')
}

function scan() {
  for (const img of document.querySelectorAll<HTMLImageElement>(SELECTOR)) {
    if (img.complete && img.naturalWidth > 0) markLoaded(img)
  }
}

export function initImageLoading() {
  // `load` and `error` do not bubble, but they can be caught on the way down. One capture listener
  // covers every image, including lazy ones that finish long after this runs, so none stay blurred.
  const onDone = (e: Event) => {
    const el = e.target
    if (el instanceof HTMLImageElement && el.matches(SELECTOR)) markLoaded(el)
  }
  document.addEventListener('load', onDone, true)
  document.addEventListener('error', onDone, true)
  // Images that finished before this ran, and pages restored from the back/forward cache.
  scan()
  window.addEventListener('pageshow', scan)
}
