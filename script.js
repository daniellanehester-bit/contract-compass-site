/* Contract Compass — scroll animation layer
   Gracefully does nothing if GSAP fails to load or the user prefers reduced motion —
   content is fully visible by default either way, so nothing depends on JS to be readable. */

(function () {
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || typeof gsap === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero content: gentle staggered entrance on load (it's already in view, so no scroll trigger).
  var heroTargets = document.querySelectorAll(".hero [data-animate]");
  if (heroTargets.length) {
    gsap.set(heroTargets, { opacity: 0, y: 22 });
    gsap.to(heroTargets, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.12,
      delay: 0.1,
    });
  }

  // Grouped rows (pain cards, how-it-works steps): stagger together as the row enters view.
  var groupedContainers = [".pain-grid", ".steps"];
  var groupedItems = [];
  groupedContainers.forEach(function (sel) {
    var group = document.querySelector(sel);
    if (!group) return;
    var items = group.querySelectorAll("[data-animate]");
    if (!items.length) return;
    items.forEach(function (el) { groupedItems.push(el); });
    gsap.set(items, { opacity: 0, y: 28 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: group,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // Everything else with data-animate: fade + slide up individually as it scrolls into view.
  var scrollTargets = document.querySelectorAll("[data-animate]");
  scrollTargets.forEach(function (el) {
    if (el.closest(".hero")) return; // handled above
    if (groupedItems.indexOf(el) !== -1) return; // handled above
    gsap.set(el, { opacity: 0, y: 28 });
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  // Sticky nav: subtle shadow once the page scrolls, for depth.
  var nav = document.querySelector(".site-nav");
  if (nav) {
    ScrollTrigger.create({
      start: "top -1",
      end: 99999,
      onUpdate: function (self) {
        nav.classList.toggle("is-scrolled", self.scroll() > 4);
      },
    });
  }
})();

/* Compass-needle animation: toggles a left-right swing on click, and occasionally
   on its own as visitors scroll/navigate. Independent of GSAP so it still works
   even if that script fails to load. Respects prefers-reduced-motion. */
(function () {
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  var logos = document.querySelectorAll(".logo-mark, .logo-mark-lg");
  if (!logos.length) return;

  function swing(logo) {
    var needle = logo.querySelector(".needle");
    if (!needle || needle.classList.contains("swinging")) return;
    needle.classList.add("swinging");
    needle.addEventListener("animationend", function handler() {
      needle.classList.remove("swinging");
      needle.removeEventListener("animationend", handler);
    });
  }

  logos.forEach(function (logo) {
    logo.addEventListener("click", function () { swing(logo); });
  });

  // Random trigger as visitors scroll: throttled so it fires at most every ~4s,
  // with roughly a 1-in-6 chance per qualifying scroll event.
  var lastTrigger = 0;
  window.addEventListener("scroll", function () {
    var now = Date.now();
    if (now - lastTrigger < 4000) return;
    if (Math.random() > 1 / 6) return;
    lastTrigger = now;
    var pick = logos[Math.floor(Math.random() * logos.length)];
    swing(pick);
  }, { passive: true });
})();
