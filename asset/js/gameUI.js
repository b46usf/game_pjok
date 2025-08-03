// gameUI.js
import { showFeedback, createConfetti } from './gameUtils.js';
import * as GameCore from './gameCore.js';

export const startBtn = document.getElementById('startBtn');
export const canvas = document.getElementById('gameCanvas');
export const questionBox = document.getElementById('questionBox');
export const startBox = document.getElementById('startBox');
export const scoreBox = document.getElementById('scoreBox');

export function toggleGameplayVisibility(visible) {
  const objects = [
    GameCore.getLabelA?.(),
    GameCore.getLabelB?.(),
    GameCore.getGoal1?.(),
    GameCore.getGoal2?.(),
    GameCore.getPlayer?.(),
    GameCore.getBall?.()
  ];
  objects.forEach(obj => {
    if (obj) obj.visible = visible;
  });
}

export function updateScoreUI(score) {
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = score;
  else console.warn('#score element not found in DOM');
}

// Mengembalikan promise agar bisa diawait
export function showResultFeedback(isCorrect) {
  return new Promise((resolve) => {
    if (isCorrect) {
      createConfetti(() => showFeedback(true, resolve));
    } else {
      showFeedback(false, resolve);
    }
  });
}
