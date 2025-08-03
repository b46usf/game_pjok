// gameUI.js
import { scene } from './gameObjects.js';
import * as GameCore from './gameCore.js';

let confetti, confettiGeometry, confettiMaterial;
let feedbackSprite = null;

export function toggleGameplayVisibility(visible) {
  const objects = [
    GameCore.getLabelA(),
    GameCore.getLabelB(),
    GameCore.getGoal1(),
    GameCore.getGoal2(),
    GameCore.getPlayer(),
    GameCore.getBall()
  ];
  objects.forEach(obj => {
    if (obj) obj.visible = visible;
  });
}

export function updateScoreUI(score) {
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = score;
}

export function showResultFeedback(isCorrect, callback) {
  if (isCorrect) {
    createConfetti(() => {
      showFeedbackSprite(true, callback);
    });
  } else {
    showFeedbackSprite(false, callback);
  }
}

function showFeedbackSprite(isCorrect, callback) {
  const textureLoader = new THREE.TextureLoader();
  const texturePath = isCorrect ? 'asset/image/check.png' : 'asset/image/wrong.png';

  textureLoader.load(
    texturePath,
    (texture) => {
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      feedbackSprite = new THREE.Sprite(material);
      feedbackSprite.scale.set(2, 2, 1);
      feedbackSprite.position.set(0, 5, -10);
      scene.add(feedbackSprite);

      setTimeout(() => {
        if (feedbackSprite) {
          scene.remove(feedbackSprite);
          feedbackSprite.material.dispose();
          feedbackSprite = null;
        }
        if (typeof callback === 'function') callback();
      }, 2500);
    },
    undefined,
    (err) => {
      console.warn('Gagal memuat sprite feedback:', err);
      if (typeof callback === 'function') callback();
    }
  );
}

function createConfetti(callback) {
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

  confettiGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  confettiGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  confettiGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

  confettiMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
  confetti = new THREE.Points(confettiGeometry, confettiMaterial);
  scene.add(confetti);
  GameCore.setIsCelebrating(true);

  setTimeout(() => {
    removeConfetti();
    if (typeof callback === 'function') callback();
  }, 2500);
}

export function updateConfetti() {
  if (!GameCore.getIsCelebrating() || !confetti) return;

  const positions = confettiGeometry.getAttribute('position');
  const velocities = confettiGeometry.getAttribute('velocity');

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
    GameCore.setIsCelebrating(false);
  }
}