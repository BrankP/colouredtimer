(() => {
  "use strict";

  // 4-digit rolling input buffer (MMSS).
  let digitBuffer = "0000";
  let timerIntervalId = null;
  let endTimestamp = 0;
  let totalDurationMs = 0;
  let selectedFinishColor = "purple";

  const FINISH_COLORS = {
    red: "#dc2626",
    blue: "#2563eb",
    purple: "#6d28d9",
    green: "#16a34a",
    pink: "#db2777"
  };

  const inputScreen = document.getElementById("input-screen");
  const runScreen = document.getElementById("run-screen");
  const display = document.getElementById("time-display");
  const resetBtn = document.getElementById("reset-btn");
  const goBtn = document.getElementById("go-btn");
  const numberButtons = Array.from(document.querySelectorAll(".num-btn"));
  const colorButtons = Array.from(document.querySelectorAll(".color-option"));
  const segments = Array.from(document.querySelectorAll(".segment"));

  function formatDisplay(buffer) {
    return `${buffer.slice(0, 2)}:${buffer.slice(2)}`;
  }

  function updateDisplay() {
    display.textContent = formatDisplay(digitBuffer);
  }

  function pushDigit(digit) {
    digitBuffer = `${digitBuffer.slice(1)}${digit}`;
    updateDisplay();
  }

  function resetInput() {
    digitBuffer = "0000";
    updateDisplay();
  }

  function bufferToSeconds(buffer) {
    const minutes = Number(buffer.slice(0, 2));
    const seconds = Number(buffer.slice(2));
    return minutes * 60 + seconds;
  }

  function applyFinishColor(colorName) {
    const resolvedColor = FINISH_COLORS[colorName] || FINISH_COLORS.purple;
    selectedFinishColor = colorName in FINISH_COLORS ? colorName : "purple";
    document.documentElement.style.setProperty("--finish-color", resolvedColor);
  }

  function selectColor(button) {
    const colorName = button.dataset.finishColor;
    if (!colorName) {
      return;
    }

    colorButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    applyFinishColor(colorName);
  }

  function setVisibleSegments(count) {
    const safeCount = Math.max(0, Math.min(5, count));

    segments.forEach((segment, index) => {
      if (index < safeCount) {
        segment.classList.remove("hidden-segment");
      } else {
        segment.classList.add("hidden-segment");
      }
    });
  }

  function finishTimer() {
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }

    runScreen.classList.add("hidden");
    applyFinishColor(selectedFinishColor);
    document.body.classList.add("finished");
  }

  function tick() {
    const now = Date.now();
    const remainingMs = Math.max(0, endTimestamp - now);

    // Remaining segment count uses elapsed proportion of total duration.
    const elapsedRatio = totalDurationMs === 0 ? 1 : (totalDurationMs - remainingMs) / totalDurationMs;
    const segmentsGone = Math.min(5, Math.floor(elapsedRatio * 5));
    const segmentsRemaining = 5 - segmentsGone;

    setVisibleSegments(segmentsRemaining);

    if (remainingMs <= 0) {
      finishTimer();
    }
  }

  function startTimer() {
    const totalSeconds = bufferToSeconds(digitBuffer);

    if (totalSeconds <= 0) {
      return;
    }

    inputScreen.classList.add("hidden");
    runScreen.classList.remove("hidden");

    setVisibleSegments(5);

    totalDurationMs = totalSeconds * 1000;
    endTimestamp = Date.now() + totalDurationMs;

    tick();

    timerIntervalId = setInterval(tick, 100);
  }

  numberButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const { digit } = btn.dataset;
      if (!digit || !/^\d$/.test(digit)) {
        return;
      }
      pushDigit(digit);
    });
  });

  colorButtons.forEach((btn) => {
    btn.addEventListener("click", () => selectColor(btn));
  });

  resetBtn.addEventListener("click", resetInput);
  goBtn.addEventListener("click", startTimer);

  applyFinishColor(selectedFinishColor);
  updateDisplay();
})();
