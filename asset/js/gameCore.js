// === State Management ===
export let currentQuestion = {};
export let answerResult = { isCorrect: false };

export let gameState = "intro"; // "intro", "playing", "celebrating"
export let isKicked = false;
export let isSlowMotion = false;
export let cinematicProgress = 0;
export let hasCinematicEnded = false;
export let cinematicEndTime = 0;
export let isCelebrating = false;
export const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 5, 12);

// === Label References ===
export let labelA = null;
export let labelB = null;

// === Utility State Setters ===
export function resetGameState() {
  isKicked = false;
  isSlowMotion = false;
  cinematicProgress = 0;
  hasCinematicEnded = false;
  cinematicEndTime = 0;
  isCelebrating = false;
}

export function setGameState(newState) {
  gameState = newState;
}

export function setLabels(labelARef, labelBRef) {
  labelA = labelARef;
  labelB = labelBRef;
}

export function setQuestion(questionData) {
  currentQuestion = questionData;
}

export function resetAnswerResult() {
  answerResult = { isCorrect: false };
}

export function setCinematicEnded() {
  hasCinematicEnded = true;
  cinematicEndTime = performance.now();
}
