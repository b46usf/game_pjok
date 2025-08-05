// gameUtils.js
import { scene } from './gameObjects.js'; // pastikan ini konsisten
let feedbackSprite = null;
let confetti = null;
let confettiGeometry = null;
let isConfettiActive = false;

export function showFeedback(isCorrect, callback) {
  if (!scene) return console.warn("Scene belum tersedia.");
  const loader = new THREE.TextureLoader();
  const texturePath = isCorrect ? "asset/image/check.png" : "asset/image/wrong.png";

  loader.load(texturePath, (texture) => {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    feedbackSprite = new THREE.Sprite(material);
    feedbackSprite.scale.set(2, 2, 1);
    feedbackSprite.position.set(0, 5, -10);
    scene.add(feedbackSprite);

    setTimeout(() => {
      removeFeedback();
      if (typeof callback === "function") callback();
    }, 2500);
  });
}

export function removeFeedback() {
  if (feedbackSprite) {
    scene.remove(feedbackSprite);
    feedbackSprite.material.dispose();
    feedbackSprite = null;
  }
}

export function createConfetti(callback) {
  if (!scene) return console.warn("Scene belum tersedia.");
  const count = 200;
  confettiGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 4;
    positions[i3 + 1] = Math.random() * 2 + 1;
    positions[i3 + 2] = -19 + Math.random();
    colors[i3] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
    velocities[i3] = (Math.random() - 0.5) * 0.1;
    velocities[i3 + 1] = -Math.random() * 0.05;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
  }

  confettiGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  confettiGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  confettiGeometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

  const confettiMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
  confetti = new THREE.Points(confettiGeometry, confettiMaterial);
  scene.add(confetti);
  isConfettiActive = true;

  setTimeout(() => {
    removeConfetti();
    if (typeof callback === "function") callback();
  }, 2500);
}

export function updateConfetti() {
  if (!isConfettiActive || !confetti) return;
  const positions = confettiGeometry.getAttribute("position");
  const velocities = confettiGeometry.getAttribute("velocity");

  for (let i = 0; i < positions.count; i++) {
    const i3 = i * 3;
    positions.array[i3] += velocities.array[i3];
    positions.array[i3 + 1] += velocities.array[i3 + 1];
    positions.array[i3 + 2] += velocities.array[i3 + 2];

    if (positions.array[i3 + 1] < 0) {
      positions.array[i3 + 1] = Math.random() * 2 + 1;
    }
  }

  positions.needsUpdate = true;
}

export function removeConfetti() {
  if (confetti) {
    scene.remove(confetti);
    confetti.geometry.dispose();
    confetti.material.dispose();
    confetti = null;
    isConfettiActive = false;
  }
}

export function drawLabelToCanvas(ctx, text, bgColor) {
  ctx.clearRect(0, 0, 128, 64);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 64, 48);
}
