import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  ScrollTrigger.getAll().forEach((t) => t.kill());

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  gsap.utils.toArray<HTMLElement>(".animate").forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 });

    if (prefersReduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      delay: i * 0.04,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
    });
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

const SHAKE_KEYFRAMES = [
  { transform: "rotate(0deg) scale(1)" },
  { transform: "rotate(-12deg) scale(1.1)" },
  { transform: "rotate(10deg) scale(1.1)" },
  { transform: "rotate(-6deg) scale(1.05)" },
  { transform: "rotate(3deg) scale(1)" },
  { transform: "rotate(0deg) scale(1)" },
];

function shakeElement(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(SHAKE_KEYFRAMES, { duration: 500, easing: "ease-out" });
}

window.shakeElement = shakeElement;

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("astro:page-load", init);
