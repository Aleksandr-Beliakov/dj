/*
 * DiJuly — галерея-веер ("fan") фотографий.
 * Чистый JS, без библиотек. Логика:
 *   - у каждой карточки есть смещение offset = index - current;
 *   - по offset считаются угол поворота, сдвиг по X, сдвиг по Y и масштаб;
 *   - активная карточка (offset=0) приподнята и крупнее, остальные
 *     расходятся дугой в стороны и немного "уходят назад" (меньше и ниже).
 * Шаг расчёта на реальной ширине/высоте карточки (offsetWidth/Height),
 * поэтому один и тот же код одинаково работает на десктопе и мобильных —
 * конкретные px карточки и их расстояние задаются в CSS (.fan-card width),
 * JS только пересчитывает геометрию дуги от них.
 */
(function () {
  "use strict";

  var stage = document.querySelector(".fan-stage");
  if (!stage) return;

  var cards = Array.prototype.slice.call(stage.querySelectorAll(".fan-card"));
  var total = cards.length;
  if (!total) return;

  var prevBtn = document.querySelector(".fan-arrow--prev");
  var nextBtn = document.querySelector(".fan-arrow--next");
  var counterCurrent = document.querySelector(".fan-counter-current");
  var counterTotal = document.querySelector(".fan-counter-total");
  if (counterTotal) counterTotal.textContent = String(total);

  // Стартуем с карточки по центру набора — веер сразу выглядит симметрично.
  var current = Math.floor((total - 1) / 2);

  var ANGLE_STEP = 10; // градусов на шаг смещения, в пределах ТЗ (8–12)
  var SWIPE_THRESHOLD = 40; // px

  var PHOTO_LABEL = {
    en: function (n, t) { return "Photo " + n + " of " + t; },
    ru: function (n, t) { return "Фото " + n + " из " + t; },
    es: function (n, t) { return "Foto " + n + " de " + t; }
  };

  function currentLang() {
    var lang = document.documentElement.getAttribute("lang");
    return PHOTO_LABEL[lang] ? lang : "en";
  }

  function render() {
    var stageWidth = stage.clientWidth;
    var cardW = cards[0].offsetWidth || 1;
    var cardH = cards[0].offsetHeight || 1;
    // Расстояние между карточками: не шире, чем нужно, чтобы веер поместился
    // по ширине контейнера — так он не вылезает за экран ни на каком размере.
    var spacingX = Math.min(cardW * 0.6, stageWidth / (total + 1.5));
    var lang = currentLang();

    cards.forEach(function (card, i) {
      var offset = i - current;
      var abs = Math.abs(offset);
      var angle = offset * ANGLE_STEP;
      var x = offset * spacingX;
      var y = offset === 0 ? -cardH * 0.12 : abs * cardH * 0.06;
      var scale = offset === 0 ? 1.35 : Math.max(0.65, 1 - abs * 0.1);
      var opacity = offset === 0 ? 1 : Math.max(0.45, 1 - abs * 0.18);
      var brightness = offset === 0 ? 1 : Math.max(0.55, 1 - abs * 0.15);

      card.style.transform =
        "translateX(-50%) translateX(" + x + "px) translateY(" + y + "px) " +
        "rotate(" + angle + "deg) scale(" + scale + ")";
      card.style.zIndex = String(100 - abs);
      card.style.opacity = String(opacity);
      card.style.filter = "brightness(" + brightness + ")";
      card.classList.toggle("is-active", offset === 0);
      if (offset === 0) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
      card.setAttribute("aria-label", PHOTO_LABEL[lang](i + 1, total));
    });

    if (counterCurrent) counterCurrent.textContent = String(current + 1);
  }

  function goTo(index) {
    current = ((index % total) + total) % total; // зацикливаем в обе стороны
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  cards.forEach(function (card, i) {
    card.addEventListener("click", function () { goTo(i); });
  });

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  // Стрелки клавиатуры — когда фокус находится где-то внутри галереи
  // (на карточке или на одной из кнопок-стрелок).
  document.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (!document.activeElement || !document.activeElement.closest(".gallery")) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") prev(); else next();
  });

  // Свайп на телефоне.
  var touchStartX = null;
  stage.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", function (event) {
    if (touchStartX == null) return;
    var dx = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (dx > SWIPE_THRESHOLD) prev();
    else if (dx < -SWIPE_THRESHOLD) next();
  }, { passive: true });

  window.addEventListener("resize", render);
  // Чтобы динамические aria-label карточек ("Photo N of 7") переводились
  // сразу при смене языка, даже если пользователь не трогал саму галерею.
  document.addEventListener("dj:langchange", render);

  render();
})();
