export function initImageLoading() {
  document.querySelectorAll('img.image-blur-load').forEach((el) => {
    const img = el as HTMLImageElement
    const shimmerContainer = img.closest('.image-loading-shimmer')
    if (img.complete) {
      img.classList.add('loaded')
      if (shimmerContainer) shimmerContainer.classList.add('loaded')
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded')
        if (shimmerContainer) shimmerContainer.classList.add('loaded')
      })
    }
  })
}
