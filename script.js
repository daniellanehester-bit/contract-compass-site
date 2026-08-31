/* Contract Compass — scroll animation layer
   Gracefully does nothing if GSAP fails to load or the user prefers reduced motion —
   content is fully visible by default either way, so nothing depends on JS to be readable.

   SAFETY NET (added after a recurring bug where the hero section rendered permanently
   blank in production): gsap.set(...) below sets opacity:0 on load, and a separate
   gsap.to(...) tween is what's supposed to bring it back to opacity:1. If that tween
   ever fails to fire or complete for any reason (plugin load-order race, a thrown
   error, ScrollTrigger not registering in time, etc.), the opacity:0 state was
   sticking permanently with nothing to undo it. Rather than chase the exact race
   condition, this version wraps the animation setup in try/catch and adds a hard
   timeout that forces every [data-animate] element to opacity:1 no matter what
   happens above, so this class of bug can't make copy disappear again. */
(function () {
     var prefersReducedMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

   var allAnimated = document.querySelectorAll("[data-animate]");

   function forceVisible() {
          allAnimated.forEach(function (el) {
                   el.style.opacity = "1";
                   el.style.transform = "none";
          });
   }

   // No matter what happens below, guarantee everything is visible within 2.5s.
   var safetyTimer = setTimeout(forceVisible, 2500);

   if (prefersReducedMotion || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
          clearTimeout(safetyTimer);
          forceVisible();
          return;
   }

   try {
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

       // Everything above ran without throwing, so the safety timer isn't strictly needed —
       // but leave it running rather than clearing it. It costs nothing if the animations
       // already finished (setting opacity:1 twice is harmless), and it stays as a backstop
       // in case any individual tween above silently stalls.
   } catch (e) {
          clearTimeout(safetyTimer);
          forceVisible();
   }
})();

/* Compass-needle logo animation: toggles a swing on click, and occasionally on its own
   as visitors scroll. Independent of GSAP so it still works even if that script fails
   to load. Respects prefers-reduced-motion. */
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
