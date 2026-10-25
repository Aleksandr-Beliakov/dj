/*
 * DiJuly — плеер списка треков.
 * Один общий <audio> на всю страницу (не по одному на трек) — переключение
 * между треками просто меняет audio.src. Плей/пауза — клик по кнопке строки.
 * Когда трек заканчивается — автоматически включается следующий по списку;
 * после последнего трека плеер останавливается (не зацикливается).
 * Перемотка — через сам прогресс-бар (.track-seek): клик/тап задаёт позицию,
 * drag (pointer-события — одинаково работает мышью и пальцем) её меняет на
 * лету, стрелки влево/вправо с фокуса на баре — перемотка на 5 секунд.
 * Отдельных кнопок перемотки нет специально — так интуитивнее.
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

  function setRowProgress(index, pct) {
    var row = rows[index];
    row.querySelector(".track-progress").style.width = pct + "%";
    row.querySelector(".track-seek").setAttribute("aria-valuenow", String(Math.round(pct)));
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
        setRowProgress(i, 0);
      }
    });
  }

  function playTrack(index) {
    if (index < 0 || index >= rows.length) return;
    if (current !== index) {
      current = index;
      audio.src = rows[index].getAttribute("data-src");
    }
    var playResult = audio.play();
    // audio.paused становится false синхронно внутри play(), но событие
    // "play" браузер доставляет асинхронной задачей — не ждём его, а сразу
    // обновляем UI, иначе при быстрой смене трека (src меняется, пока
    // предыдущий ещё играл) может проскочить "паразитный" pause-эвент
    // от сброса src и визуально оставить кнопку в состоянии "play".
    refreshUI();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        // play() могли прервать (например, быстрым повторным кликом) —
        // синхронизируем UI с реальным состоянием audio ещё раз.
        refreshUI();
      });
    }
  }

  function seekToClientX(index, seekEl, clientX) {
    if (!isFinite(audio.duration) || audio.duration <= 0) return;
    var rect = seekEl.getBoundingClientRect();
    var fraction = rect.width ? (clientX - rect.left) / rect.width : 0;
    fraction = Math.max(0, Math.min(1, fraction));
    audio.currentTime = fraction * audio.duration;
    setRowProgress(index, fraction * 100);
  }

  rows.forEach(function (row, i) {
    row.querySelector(".track-btn").addEventListener("click", function () {
      if (i === current && !audio.paused) {
        audio.pause();
        refreshUI();
      } else {
        playTrack(i);
      }
    });

    var seekEl = row.querySelector(".track-seek");
    var dragging = false;

    seekEl.addEventListener("pointerdown", function (event) {
      if (i !== current) {
        // На ещё не выбранном треке позиция неизвестна (не загружен) —
        // клик по его полосе просто запускает трек, как клик по play.
        playTrack(i);
        return;
      }
      dragging = true;
      try { seekEl.setPointerCapture(event.pointerId); } catch (e) {}
      seekToClientX(i, seekEl, event.clientX);
    });
    seekEl.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      seekToClientX(i, seekEl, event.clientX);
    });
    function stopDragging(event) {
      if (!dragging) return;
      dragging = false;
      try { seekEl.releasePointerCapture(event.pointerId); } catch (e) {}
    }
    seekEl.addEventListener("pointerup", stopDragging);
    seekEl.addEventListener("pointercancel", stopDragging);

    seekEl.addEventListener("keydown", function (event) {
      if (i !== current || !isFinite(audio.duration) || audio.duration <= 0) return;
      if (event.key === "ArrowRight") {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      } else if (event.key === "ArrowLeft") {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      } else {
        return;
      }
      event.preventDefault();
      setRowProgress(i, (audio.currentTime / audio.duration) * 100);
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
    setRowProgress(current, (audio.currentTime / audio.duration) * 100);
  });

  document.addEventListener("dj:langchange", refreshUI);

  refreshUI();
})();
