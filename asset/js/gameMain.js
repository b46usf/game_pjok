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
  camera,
  renderer,
} from './gameObjects.js';

import {
  onCanvasClick,
  onKeyDown,
  onKeyUp,
  updateGameLogic,
  resetBallPhysics,
  checkAnswerFromLabelHit,
} from './gameLogic.js';

import {
  prepareNextLevel,
  updateQuestionUI,
} from './gameQuestion.js';

import { onWindowResize } from './gameObjects.js';
import { updateConfetti, removeConfetti } from './gameUtils.js';
import { resetGameState, gameState } from './gameCore.js';

// === Inisialisasi saat DOM siap ===
document.addEventListener("DOMContentLoaded", () => {
  if (questionBox) questionBox.style.display = "block";
  if (startBox) startBox.style.display = "block";
  if (scoreBox) scoreBox.style.display = "none";
  if (canvas) canvas.style.display = "none";

  prepareNextLevel(); // Set soal awal
  initGameMain();     // Binding event
});

// === Event Binding ===
function initGameMain() {
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (canvas) canvas.addEventListener("mousedown", onCanvasClick);
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
}

// === Fungsi Start Game ===
function startGame() {
  // Cegah duplikasi atau restart di tengah game
  if (gameState !== "intro") return;

  // Bersihkan confetti lama (jika ada)
  removeConfetti();

  // Bersihkan pesan congrats lama jika ada
  const congrats = document.getElementById("congratsText");
  if (congrats) congrats.remove();

  // Setup scene baru
  setupScene();
  setupCamera();
  setupRenderer(canvas);
  setupLighting();
  loadPlayer();
  loadGoals();
  createLabels();

  // Reset & mulai ulang semua status game
  resetGameState();
  updateQuestionUI();

  toggleGameplayVisibility(true);

  questionBox.style.display = "none";
  startBox.style.display = "none";
  scoreBox.style.display = "block";
  canvas.style.display = "block";

  animate(); // mulai loop
}

// === Game Loop ===
function animate() {
  requestAnimationFrame(animate);

  updateGameLogic();
  updateConfetti();

  renderer.render(scene, camera);
}
