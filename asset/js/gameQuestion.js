// gameQuestion.js
import { labelA, labelB } from './gameCore.js';
import { drawLabelToCanvas } from './gameUI.js';

export const questions = {
  1: { soal: "Angka Genap", jawaban: ["2", "3"], benar: "2" },
  2: { soal: "Bilangan Prima", jawaban: ["4", "5"], benar: "5" },
  3: { soal: "Kelipatan 3", jawaban: ["6", "7"], benar: "6" },
  4: { soal: "Lebih besar dari 5", jawaban: ["4", "7"], benar: "7" },
  5: { soal: "Kurang dari 10", jawaban: ["12", "8"], benar: "8" }
};

export let currentQuestion = {};
export let currentLevel = 1;

export function generateQuestion(level = 1) {
  const data = questions[level];
  const isCorrectLeft = Math.random() < 0.5;
  const [correct, wrong] = data.jawaban[0] === data.benar
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