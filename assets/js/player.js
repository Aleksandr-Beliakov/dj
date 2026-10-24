/*
 * DiJuly — плеер списка треков.
 * Один общий <audio> на всю страницу (не по одному на трек) — переключение
 * между треками просто меняет audio.src. Плей/пауза — клик по кнопке строки.
 * Когда трек заканчивается — автоматически включается следующий по списку;
 * после последнего трека плеер останавливается (не зацикливается).
 */
(function () {
  "use strict";

  var list = document.querySelector(".tracks-list");
  if (!list) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll(".track"));
  if (!rows.length) return;

  var audio = new Audio();
  audio.preload = "none";

  var current = -1; // индекс трека, загруженного в audio (не обязательно играющего)

  var LABEL = {
    play: { en: "Play", ru: "Воспроизвести", es: "Reproducir" },
    pause: { en: "Pause", ru: "Пауза", es: "Pausa" }
  };

  function currentLang() {
    var lang = document.documentElement.getAttribute("lang");
    return LABEL.play[lang] ? lang : "en";
  }

  function refreshUI() {
    var lang = currentLang();
    rows.forEach(function (row, i) {
      var playing = i === current && !audio.paused;
      row.classList.toggle("is-playing", playing);
      row.querySelector(".icon-play").hidden = playing;
      row.querySelector(".icon-pause").hidden = !playing;
      row.querySelector(".track-btn").setAttribute(
        "aria-label",
        playing ? LABEL.pause[lang] : LABEL.play[lang]
      );
      if (i !== current) {
        row.querySelector(".track-progress").style.width = "0%";
      }
    });
  }

  function playTrack(index) {
    if (index < 0 || index >= rows.length) return;
    if (current !== index) {
      current = index;
      audio.src = rows[index].getAttribute("data-src");
    }
    audio.play();
  }

  rows.forEach(function (row, i) {
    row.querySelector(".track-btn").addEventListener("click", function () {
      if (i === current && !audio.paused) {
        audio.pause();
      } else {
        playTrack(i);
      }
    });
  });

  audio.addEventListener("play", refreshUI);
  audio.addEventListener("pause", refreshUI);

  audio.addEventListener("ended", function () {
    if (current + 1 < rows.length) {
      playTrack(current + 1);
    } else {
      current = -1;
      refreshUI();
    }
  });

  audio.addEventListener("timeupdate", function () {
    if (current < 0 || !audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    rows[current].querySelector(".track-progress").style.width = pct + "%";
  });

  document.addEventListener("dj:langchange", refreshUI);

  refreshUI();
})();
