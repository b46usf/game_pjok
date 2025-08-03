import {
  player, ball, camera, resetBallPosition
} from './gameObjects.js';

import {
  getLabelA, getLabelB,
  getIsKicked, setIsKicked,
  getCurrentQuestion, getAnswerResult,
  getIsCelebrating, setIsCelebrating,
  getCinematicProgress, setCinematicProgress,
  getHasCinematicEnded, setCinematicEnded, getCinematicEndTime,
  setIsSlowMotion, getIsSlowMotion,
  resetGameState
} from './gameCore.js';

import { toggleGameplayVisibility, showResultFeedback, updateScoreUI } from './gameUI.js';

const gravity = 0.4;
const velocity = new THREE.Vector3();

let moveDir = 0;
let elevation = 0;
let elevationSpeed = 0;
let score = 0;

export function onKeyDown(e) {
  if (e.key === "ArrowLeft") moveDir = -1;
  else if (e.key === "ArrowRight") moveDir = 1;
}

export function onKeyUp(e) {
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) moveDir = 0;
}

export function onCanvasClick(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([getLabelA(), getLabelB()]);
  if (intersects.length === 0 || getIsKicked() || !ball) return;

  const clickedLabel = intersects[0].object.name;
  const direction = new THREE.Vector3().subVectors(intersects[0].object.position, ball.position).normalize();

  velocity.copy(direction.multiplyScalar(0.5));
  elevation = ball.position.y;
  elevationSpeed = 1.5;
  setIsKicked(true);

  checkAnswer(clickedLabel);
}

function checkAnswer(label) {
  const result = getAnswerResult();
  result.isCorrect = label === getCurrentQuestion().correctLabel;
}

export function updateGameLogic() {
  if (!getIsKicked() && player && ball) {
    updatePlayerMovement();
    return;
  }

  if (getIsKicked() && ball) {
    updateBallMovement();
    updateCinematicCamera();
    checkCinematicEnd();

    if (
      getHasCinematicEnded() &&
      performance.now() - getCinematicEndTime() > 1000 &&
      !getIsCelebrating()
    ) {
      handlePostCinematic();
    }
  }
}

function updatePlayerMovement() {
  player.position.x = THREE.MathUtils.clamp(player.position.x + moveDir * 0.1, -5, 5);
  resetBallPosition();
}

function updateBallMovement() {
  if (ball.position.z < -10 && !getIsSlowMotion()) {
    setIsSlowMotion(true);
    velocity.multiplyScalar(0.3);
  }

  ball.position.add(velocity);
  elevationSpeed -= gravity;
  elevation += elevationSpeed;
  ball.position.y = Math.max(elevation, 0.2);
}

function updateCinematicCamera() {
  let progress = getCinematicProgress();
  if (progress < 1) {
    progress += getIsSlowMotion() ? 0.003 : 0.01;
    setCinematicProgress(progress);

    const target = new THREE.Vector3(
      ball.position.x,
      5 + progress * 3,
      ball.position.z + 8 - progress * 6
    );

    camera.position.lerp(target, getIsSlowMotion() ? 0.02 : 0.05);
    camera.lookAt(ball.position);
  }
}

function handlePostCinematic() {
  const isCorrect = getAnswerResult().isCorrect;

  toggleGameplayVisibility(false);
  resetBallPhysics();

  showResultFeedback(isCorrect).then(() => {
    if (isCorrect) {
      score++;
      updateScoreUI(score);
    }

    setIsCelebrating(true);
  });
}

export function resetBallPhysics() {
  resetGameState();
  velocity.set(0, 0, 0);
  if (ball && player) resetBallPosition();
}

function checkCinematicEnd() {
  if (!getHasCinematicEnded() && getCinematicProgress() >= 1) {
    setCinematicEnded();
  }
}

export function getScore() {
  return score;
}
