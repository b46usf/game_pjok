export const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 5, 12);

// === Internal State ===
let currentQuestion = {};
let answerResult = { isCorrect: false };

let gameState = "intro"; // intro | playing | celebrating
let isKicked = false;
let isSlowMotion = false;
let cinematicProgress = 0;
let hasCinematicEnded = false;
let cinematicEndTime = 0;
let isCelebrating = false;

let labelA = null;
let labelB = null;

let player = null;
let ball = null;
let goal1 = null;
let goal2 = null;

export function setPlayer(obj) { player = obj; }
export function getPlayer() { return player; }

export function setBall(obj) { ball = obj; }
export function getBall() { return ball; }

export function setGoal1(obj) { goal1 = obj; }
export function getGoal1() { return goal1; }

export function setGoal2(obj) { goal2 = obj; }
export function getGoal2() { return goal2; }

// === Game Object Getters ===
export function getGameState() {
  return gameState;
}
export function setGameState(newState) {
  gameState = newState;
}

export function getCurrentQuestion() {
  return currentQuestion;
}
export function setQuestion(questionData) {
  currentQuestion = questionData;
}

export function getAnswerResult() {
  return answerResult;
}
export function resetAnswerResult() {
  answerResult = { isCorrect: false };
}

// === Kick State ===
export function getIsKicked() {
  return isKicked;
}
export function setIsKicked(val) {
  isKicked = val;
}

// === Slow Motion ===
export function getIsSlowMotion() {
  return isSlowMotion;
}
export function setIsSlowMotion(val) {
  isSlowMotion = val;
}

// === Cinematic Progress ===
export function getCinematicProgress() {
  return cinematicProgress;
}
export function setCinematicProgress(val) {
  cinematicProgress = val;
}

export function getHasCinematicEnded() {
  return hasCinematicEnded;
}
export function getCinematicEndTime() {
  return cinematicEndTime;
}
export function setCinematicEnded() {
  hasCinematicEnded = true;
  cinematicEndTime = performance.now();
}

// === Celebration ===
export function getIsCelebrating() {
  return isCelebrating;
}
export function setIsCelebrating(val) {
  isCelebrating = val;
}

// === Labels (UI Sprites) ===
export function getLabelA() {
  return labelA;
}
export function getLabelB() {
  return labelB;
}
export function setLabels(labelARef, labelBRef) {
  labelA = labelARef;
  labelB = labelBRef;
}

// === Reset All Game State ===
export function resetGameState() {
  isKicked = false;
  isSlowMotion = false;
  cinematicProgress = 0;
  hasCinematicEnded = false;
  cinematicEndTime = 0;
  isCelebrating = false;
  answerResult = { isCorrect: false };
}
