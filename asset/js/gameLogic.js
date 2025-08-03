import { player, ball, velocity, gravity, camera, resetBallPosition } from './gameObjects.js';
import * as GameState from './gameCore.js';
import { toggleGameplayVisibility, showResultFeedback, updateScoreUI } from './gameUI.js';

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
  const intersects = raycaster.intersectObjects([GameState.labelA, GameState.labelB]);

  if (intersects.length === 0 || GameState.isKicked || !ball) return;

  const clickedLabel = intersects[0].object.name;
  const direction = new THREE.Vector3().subVectors(intersects[0].object.position, ball.position).normalize();

  velocity.copy(direction.multiplyScalar(0.5));
  elevation = ball.position.y;
  elevationSpeed = 1.5;
  GameState.isKicked = true;

  checkAnswer(clickedLabel);
}

function checkAnswer(label) {
  GameState.answerResult.isCorrect = label === GameState.currentQuestion.correctLabel;
}

export function updateGameLogic() {
  if (!GameState.isKicked && player && ball) {
    updatePlayerMovement();
    return;
  }

  if (GameState.isKicked && ball) {
    updateBallMovement();
    updateCinematicCamera();

    if (!GameState.hasCinematicEnded && GameState.cinematicProgress >= 1) {
      GameState.hasCinematicEnded = true;
      GameState.cinematicEndTime = performance.now();
    }

    if (GameState.hasCinematicEnded &&
        performance.now() - GameState.cinematicEndTime > 1000 &&
        !GameState.isCelebrating) {
      handlePostCinematic();
    }
  }
}

function updatePlayerMovement() {
  player.position.x = THREE.MathUtils.clamp(player.position.x + moveDir * 0.1, -5, 5);
  resetBallPosition();
}

function updateBallMovement() {
  if (ball.position.z < -10 && !GameState.isSlowMotion) {
    GameState.isSlowMotion = true;
    velocity.multiplyScalar(0.3);
  }

  ball.position.add(velocity);
  elevationSpeed -= gravity;
  elevation += elevationSpeed;
  ball.position.y = Math.max(elevation, 0.2);
}

function updateCinematicCamera() {
  if (GameState.cinematicProgress < 1) {
    GameState.cinematicProgress += GameState.isSlowMotion ? 0.003 : 0.01;

    const target = new THREE.Vector3(
      ball.position.x,
      5 + GameState.cinematicProgress * 3,
      ball.position.z + 8 - GameState.cinematicProgress * 6
    );

    camera.position.lerp(target, GameState.isSlowMotion ? 0.02 : 0.05);
    camera.lookAt(ball.position);
  }
}

function handlePostCinematic() {
  const { isCorrect } = GameState.answerResult;

  toggleGameplayVisibility(false);
  resetBallPhysics();
  showResultFeedback(isCorrect);

  if (isCorrect) {
    score++;
    updateScoreUI(score);
  }

  GameState.isCelebrating = true;
}

export function resetBallPhysics() {
  GameState.isKicked = false;
  GameState.isSlowMotion = false;
  GameState.cinematicProgress = 0;
  GameState.hasCinematicEnded = false;
  GameState.cinematicEndTime = 0;
  GameState.isCelebrating = false;

  velocity.set(0, 0, 0);
  if (ball && player) resetBallPosition();
}

export function getScore() {
  return score;
}