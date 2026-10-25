/*
 * DiJuly — переключатель языка (EN / RU / ES).
 * Нет сборки/фреймворка на сайте, поэтому всё — один небольшой файл:
 * словари переводов + логика переключателя.
 *
 * Как добавить новую переводимую строку:
 *   1. В HTML добавить атрибут data-i18n="ключ" (меняет textContent) или
 *      data-i18n-aria="ключ" (меняет aria-label — для кнопок/иконок без текста).
 *   2. Добавить "ключ": "..." в каждый из словарей ниже (en/ru/es).
 * При смене языка кидается document-событие "dj:langchange" — на него можно
 * подписаться из другого скрипта (например gallery.js), если его собственным
 * динамическим элементам (созданным через JS) тоже нужно локализоваться.
 * Чего НЕ переводим осознанно: DiJuly, Dressed in Sound, названия жанров,
 * Basic/Standard/Premium, цены — это бренд-элементы, см. DOCS.md.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "dj_lang";
  var LANGS = ["en", "ru", "es"];
  var DEFAULT_LANG = "en";

  var I18N = {
    en: {
      basic_condition: "up to 2 hours",
      standard_condition: "up to 4 hours",
      premium_condition: "up to 6 hours",
      meta_description:
        "DiJuly — DJ for weddings, private parties and corporate events. Pop, Dance, Disco, House. Basic, Standard and Premium packages.",
      lang_name_en: "English",
      lang_name_ru: "Russian",
      lang_name_es: "Spanish",
      gallery_aria_label: "DJ photo gallery",
      gallery_prev: "Previous photo",
      gallery_next: "Next photo",
      book_now: "Book Now",
      track_seek: "Seek"
    },
    ru: {
      basic_condition: "до 2 часов",
      standard_condition: "до 4 часов",
      premium_condition: "до 6 часов",
      meta_description:
        "DiJuly — диджей на свадьбу, частную вечеринку и корпоратив. Pop, Dance, Disco, House. Пакеты Basic, Standard и Premium.",
      lang_name_en: "английский",
      lang_name_ru: "русский",
      lang_name_es: "испанский",
      gallery_aria_label: "Галерея фото диджея",
      gallery_prev: "Предыдущее фото",
      gallery_next: "Следующее фото",
      book_now: "Забронировать",
      track_seek: "Перемотка"
    },
    es: {
      basic_condition: "hasta 2 horas",
      standard_condition: "hasta 4 horas",
      premium_condition: "hasta 6 horas",
      meta_description:
        "DiJuly — DJ para bodas, fiestas privadas y eventos corporativos. Pop, Dance, Disco, House. Paquetes Basic, Standard y Premium.",
      lang_name_en: "inglés",
      lang_name_ru: "ruso",
      lang_name_es: "español",
      gallery_aria_label: "Galería de fotos del DJ",
      gallery_prev: "Foto anterior",
      gallery_next: "Foto siguiente",
      book_now: "Reservar Ahora",
      track_seek: "Buscar"
    }
  };

  // Шаблон aria-label кнопки на языке, который сейчас АКТИВЕН на странице.
  var SWITCH_LABEL = {
    en: function (name) { return "Switch to " + name; },
    ru: function (name) { return "Переключить на " + name; },
    es: function (name) { return "Cambiar a " + name; }
  };

  function getStoredLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {
      /* localStorage недоступен (приватный режим и т.п.) — используем язык по умолчанию */
    }
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ничего страшного, просто не запомнится между визитами */
    }
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var dict = I18N[lang];

    document.documentElement.setAttribute("lang", lang);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (dict[key] != null) nodes[i].textContent = dict[key];
    }

    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && dict.meta_description) {
      metaDescription.setAttribute("content", dict.meta_description);
    }

    var ariaNodes = document.querySelectorAll("[data-i18n-aria]");
    for (var a = 0; a < ariaNodes.length; a++) {
      var ariaKey = ariaNodes[a].getAttribute("data-i18n-aria");
      if (dict[ariaKey] != null) ariaNodes[a].setAttribute("aria-label", dict[ariaKey]);
    }

    var buttons = document.querySelectorAll(".lang-switch button[data-lang]");
    for (var j = 0; j < buttons.length; j++) {
      var btn = buttons[j];
      var btnLang = btn.getAttribute("data-lang");
      if (btnLang === lang) {
        btn.hidden = true;
      } else {
        btn.hidden = false;
        var name = dict["lang_name_" + btnLang] || btnLang;
        btn.setAttribute("aria-label", SWITCH_LABEL[lang](name));
      }
    }

    setStoredLang(lang);

    // Даёт знать другим скриптам на странице (например галерее), что язык сменился,
    // чтобы они обновили свои собственные динамические aria-label и т.п.
    document.dispatchEvent(new CustomEvent("dj:langchange", { detail: { lang: lang } }));
  }

  function initSwitcher() {
    var container = document.querySelector(".lang-switch");
    if (!container) return;
    container.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-lang]");
      if (!btn) return;
      applyLang(btn.getAttribute("data-lang"));
    });
  }

  initSwitcher();
  applyLang(getStoredLang());
})();
