import { getLabelA, getLabelB } from './gameCore.js';
import { drawLabelToCanvas } from './gameUtils.js';

// === Static Question Data ===
const questions = {
  1: { soal: "Angka Genap", jawaban: ["2", "3"], benar: "2" },
  2: { soal: "Bilangan Prima", jawaban: ["4", "5"], benar: "5" },
  3: { soal: "Kelipatan 3", jawaban: ["6", "7"], benar: "6" },
  4: { soal: "Lebih besar dari 5", jawaban: ["4", "7"], benar: "7" },
  5: { soal: "Kurang dari 10", jawaban: ["12", "8"], benar: "8" }
};

let currentLevel = 1;
let currentQuestion = {};

export function generateQuestion(level = currentLevel) {
  const data = questions[level];
  if (!data) {
    console.warn(`No question found for level ${level}`);
    return;
  }

  const isCorrectLeft = Math.random() < 0.5;
  const [correct, wrong] =
    data.jawaban[0] === data.benar
      ? [data.jawaban[0], data.jawaban[1]]
      : [data.jawaban[1], data.jawaban[0]];

  currentQuestion = {
    question: data.soal,
    correctAnswer: data.benar,
    options: isCorrectLeft ? [correct, wrong] : [wrong, correct],
    correctLabel: isCorrectLeft ? "A" : "B"
  };
}

export function updateQuestionUI() {
  const questionText = document.getElementById("questionText");
  if (questionText) {
    questionText.textContent = currentQuestion.question || "SOAL KOSONG!";
  }

  updateLabelTextures();
}

function updateLabelTextures() {
  const labelA = getLabelA();
  const labelB = getLabelB();

  if (!labelA || !labelB || !currentQuestion.options) return;

  const labels = [labelA, labelB];
  labels.forEach((label, i) => {
    drawLabelToCanvas(
      label.updateCtx,
      currentQuestion.options[i],
      i === 0 ? "#1900FF" : "#FF0040"
    );
    label.texture.needsUpdate = true;
  });
}

// Public
export function prepareNextLevel() {
  generateQuestion(currentLevel);
  updateQuestionUI();
}

export function incrementLevel() {
  currentLevel++;
}

export function resetLevel() {
  currentLevel = 1;
}

export function getCurrentLevel() {
  return currentLevel;
}

export function getCurrentQuestion() {
  return currentQuestion;
}
