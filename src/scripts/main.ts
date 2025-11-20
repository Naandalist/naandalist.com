function init() {
  onScroll();
  animate();

  const backToTop = document.getElementById("back-to-top");
  backToTop?.addEventListener("click", (event) => scrollToTop(event));

  const backToPrev = document.getElementById("back-to-prev");
  backToPrev?.addEventListener("click", () => window.history.back());

  document.addEventListener("scroll", onScroll);
}

function animate() {
  const animateElements = document.querySelectorAll(".animate");

  animateElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("show");
    }, index * 150);
  });
}

function onScroll() {
  if (window.scrollY > 0) {
    document.documentElement.classList.add("scrolled");
  } else {
    document.documentElement.classList.remove("scrolled");
  }
}

function scrollToTop(event: Event) {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

document.addEventListener("DOMContentLoaded", () => init());
document.addEventListener("astro:page-load", () => init());
