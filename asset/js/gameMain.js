import {
  startBtn,
  canvas,
  questionBox,
  startBox,
  scoreBox,
  toggleGameplayVisibility,
} from './gameUI.js';

import {
  setupScene,
  setupCamera,
  setupRenderer,
  setupLighting,
  loadPlayer,
  loadGoals,
  createLabels,
  scene,
  renderer,
  camera,
} from './gameObjects.js';

import { onCanvasClick, onKeyDown, onKeyUp, updateGameLogic } from './gameLogic.js';
import { prepareNextLevel } from './gameQuestion.js';
import { onWindowResize } from './gameObjects.js';
import { updateConfetti } from './gameUtils.js';
import { resetGameState } from './gameCore.js';

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

// === Fungsi Start Game ===
function startGame() {
  setupScene();
  setupCamera();
  setupRenderer(canvas);
  setupLighting();
  loadPlayer();
  loadGoals();
  createLabels();

  resetGameState();
  toggleGameplayVisibility(true);

  canvas.style.display = "block";
  scoreBox.style.display = "block";

  animate();
}

// === Game Loop ===
function animate() {
  requestAnimationFrame(animate);

  updateGameLogic();
  updateConfetti();

  renderer.render(scene, camera);
}