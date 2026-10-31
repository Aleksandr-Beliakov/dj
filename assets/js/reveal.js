/*
 * DiJuly — плавное появление выборочных блоков при первом попадании
 * в видимую область (Mixcloud-плеер, карточки тарифов, ряд соцсетей,
 * веер фото). Герой и список треков не участвуют — они видны сразу.
 */
(function () {
  "use strict";

  var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  els.forEach(function (el) { observer.observe(el); });
})();
