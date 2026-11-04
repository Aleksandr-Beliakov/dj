/*
 * DiJuly — слоган "Dressed in Sound" под именем в hero-плашке.
 * Бренд-текст, не переводится (см. DOCS.md), поэтому строка задана здесь.
 * Каждая буква — отдельный <span>, .hero__tagline растягивает их через
 * justify-content: space-between на ширину бокса имени.
 *
 * Ширина бокса ≠ ширина видимых букв: у глифов шрифта есть боковые поля
 * (side bearing), и они растут с размером шрифта. У "D" в имени (~108px)
 * чернила начинаются на ~12px правее края бокса, у "D" слогана (~23px) —
 * на ~1px. Поэтому align() меряет реальные края чернил первой/последней
 * буквы имени и слогана (canvas measureText) и ставит слогану padding так,
 * чтобы края видимых букв совпали точно.
 */
(function () {
  "use strict";

  var TAGLINE = "Dressed in Sound";

  var el = document.querySelector(".hero__tagline");
  var nameEl = document.querySelector(".hero__name");
  if (!el || !nameEl) return;

  var ctx = document.createElement("canvas").getContext("2d");

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
    align();
  }

  function glyph(styleEl, ch) {
    var cs = getComputedStyle(styleEl);
    ctx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    var m = ctx.measureText(cs.textTransform === "uppercase" ? ch.toUpperCase() : ch);
    return { left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight };
  }

  function charOriginX(textNode, index) {
    var range = document.createRange();
    range.setStart(textNode, index);
    range.setEnd(textNode, index + 1);
    return range.getBoundingClientRect().left;
  }

  function align() {
    var text = nameEl.firstChild;
    if (!text || text.nodeType !== 3 || !text.length) return;
    var letters = el.querySelectorAll("span:not(.hero__tagline-space)");
    if (!letters.length) return;

    var last = text.length - 1;
    var nameInkLeft = charOriginX(text, 0) + glyph(nameEl, text.data[0]).left;
    var nameInkRight = charOriginX(text, last) + glyph(nameEl, text.data[last]).right;

    var first = letters[0];
    var end = letters[letters.length - 1];
    var firstInk = glyph(el, first.textContent);
    var endInk = glyph(el, end.textContent);
    var endAdvance = end.getBoundingClientRect().width;

    var box = el.getBoundingClientRect();
    el.style.paddingLeft = Math.max(0, nameInkLeft - box.left - firstInk.left) + "px";
    el.style.paddingRight = Math.max(0, box.right - nameInkRight - (endAdvance - endInk.right)) + "px";
  }

  render();
  document.addEventListener("dj:langchange", render);
  window.addEventListener("resize", align);
  if (document.fonts) {
    document.fonts.ready.then(align);
    document.fonts.addEventListener("loadingdone", align);
  }
})();
