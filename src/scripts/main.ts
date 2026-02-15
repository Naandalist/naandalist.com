let isScrollListenerBound = false;

function init() {
  onScroll();
  animate();

  const backToTop = document.getElementById("back-to-top");
  if (backToTop && backToTop.dataset.boundClick !== "true") {
    backToTop.addEventListener("click", scrollToTop);
    backToTop.dataset.boundClick = "true";
  }

  const backToPrev = document.getElementById("back-to-prev");
  if (backToPrev && backToPrev.dataset.boundClick !== "true") {
    backToPrev.addEventListener("click", goToPreviousPage);
    backToPrev.dataset.boundClick = "true";
  }

  if (!isScrollListenerBound) {
    document.addEventListener("scroll", onScroll, { passive: true });
    isScrollListenerBound = true;
  }
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

function goToPreviousPage() {
  window.history.back();
}

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("astro:page-load", init);
