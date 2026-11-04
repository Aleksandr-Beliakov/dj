/*
 * DiJuly — слоган "Dressed in Sound" под именем в hero-плашке.
 * Бренд-текст, не переводится ни на одном языке (см. i18n.js/DOCS.md) —
 * поэтому строка задана здесь, а не в словарях i18n. Раскладывается на
 * отдельные <span> по букве через JS (а не вручную в разметке), чтобы
 * .hero__tagline могла растянуть их через justify-content: space-between
 * ровно на ширину имени над ней. Пробелы между словами — отдельные span с
 * фиксированной шириной (.hero__tagline-space, размер — в CSS, fluid).
 * Перестраивается при "dj:langchange" на случай, если текст когда-нибудь
 * станет зависеть от языка — сейчас это просто безвредный повторный рендер
 * одной и той же строки.
 */
(function () {
  "use strict";

  var TAGLINE = "Dressed in Sound";

  var el = document.querySelector(".hero__tagline");
  if (!el) return;

  function render() {
    el.textContent = "";
    el.setAttribute("aria-label", TAGLINE);
    TAGLINE.split("").forEach(function (ch) {
      var span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      if (ch === " ") {
        span.className = "hero__tagline-space";
      } else {
        span.textContent = ch;
      }
      el.appendChild(span);
    });
  }

  render();
  document.addEventListener("dj:langchange", render);
})();
