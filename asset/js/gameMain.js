import {
  startBtn,
  canvas,
  questionBox,
  startBox,
  scoreBox,
  onWindowResize,
} from './gameUI.js';

import { onCanvasClick, onKeyDown, onKeyUp } from './gameLogic.js';
import { prepareNextLevel } from './gameQuestion.js';
import { startGame } from './gameUtils.js';

// === Inisialisasi saat DOM siap ===
document.addEventListener("DOMContentLoaded", () => {
  if (questionBox) questionBox.style.display = "block";
  if (startBox) startBox.style.display = "block";
  if (scoreBox) scoreBox.style.display = "none";
  if (canvas) canvas.style.display = "none";

  prepareNextLevel(); // Set soal awal
  initGameMain();
});

// === Event Binding Terpisah ===
function initGameMain() {
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (canvas) canvas.addEventListener("mousedown", onCanvasClick);
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
}
