// === Global Variables ===
let scene, camera, renderer;
let player, ball;
let moveDir = 0, isKicked = false;
let velocity = new THREE.Vector3();
let elevation = 0;
let elevationSpeed = 0;
const gravity = 0.4;
let animationId;
let currentQuestion = {};
let currentLevel = 1;
let labelA, labelB;
let score = 0;
let cinematicProgress = 0;
let isSlowMotion = false;
let confetti, confettiMaterial, confettiGeometry;
let isCelebrating = false;
const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 5, 12);
let gameState = "intro"; // "intro", "playing", "celebrating"

// === Questions Data ===
const questions = {
  1: { soal: "Angka Genap", jawaban: ["2", "3"], benar: "2" },
  2: { soal: "Bilangan Prima", jawaban: ["4", "5"], benar: "5" },
  3: { soal: "Kelipatan 3", jawaban: ["6", "7"], benar: "6" },
  4: { soal: "Lebih besar dari 5", jawaban: ["4", "7"], benar: "7" },
  5: { soal: "Kurang dari 10", jawaban: ["12", "8"], benar: "8" }
};

// === DOM Elements ===
const canvas = document.getElementById("gameCanvas");
const startBtn = document.getElementById("startBtn");
const questionBox = document.getElementById("questionBox");
const startBox = document.getElementById("startBox");
const scoreBox = document.querySelector('[id="score"]').parentElement.parentElement;
const questionText = document.getElementById("questionText");

// === Event Listeners ===
startBtn.addEventListener("click", startGame);
canvas.addEventListener("mousedown", onCanvasClick);
window.addEventListener("resize", onWindowResize);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

// === Game Initialization ===
function startGame() {
  if (gameState !== "intro") return;

  gameState = "playing";

  questionBox.style.display = "none";
  startBox.style.display = "none";
  scoreBox.style.display = "block";
  canvas.style.display = "block";

  resetCamera();
  init();
  animate();
}

function init() {
  setupScene();
  setupCamera();
  setupRenderer();
  setupLighting();
  loadPlayer();
  loadGoals();
  createLabels();
  updateQuestionUI();
}

function setupScene() {
  scene = new THREE.Scene();
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  resetCamera();
}

function resetCamera() {
  if (!camera) return;
  camera.position.copy(DEFAULT_CAMERA_POS);
  camera.lookAt(new THREE.Vector3(0, 1.5, 0)); // Fokus ke pemain tengah
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupLighting() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function onKeyDown(e) {
  if (e.key === "ArrowLeft") moveDir = -1;
  if (e.key === "ArrowRight") moveDir = 1;
}

function onKeyUp(e) {
  if (["ArrowLeft", "ArrowRight"].includes(e.key)) moveDir = 0;
}

function loadPlayer() {
  const loader = new THREE.TextureLoader();
  loader.load("asset/image/player.png", (texture) => {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    player = new THREE.Sprite(material);
    player.scale.set(1.5, 3, 1);
    player.position.set(0, 1.5, 6);
    scene.add(player);
    createBall();
  });
}

function createBall() {
  const geometry = new THREE.SphereGeometry(0.3, 32, 32);
  const texture = new THREE.TextureLoader().load("asset/image/soccer-ball.png");
  const material = new THREE.MeshStandardMaterial({ map: texture });
  ball = new THREE.Mesh(geometry, material);
  resetBallPosition();
  scene.add(ball);
}

function resetBallPosition() {
  ball.position.set(player.position.x + 0.3, 0.2, player.position.z - 1);
}

function loadGoals() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("asset/image/goal.png", (goalTexture) => {
    const goalMaterial = new THREE.MeshBasicMaterial({ map: goalTexture, transparent: true, side: THREE.DoubleSide });

    const goal1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), goalMaterial);
    goal1.position.set(10, 4, -20);
    scene.add(goal1);

    const goal2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), goalMaterial.clone());
    goal2.position.set(-10, 4, -20);
    scene.add(goal2);
  });
}

function createLabels() { 
  labelA = createLabel("A", "#1900FF", -10);
  labelB = createLabel("B", "#FF0040", 10);
  console.log("Label A & B created", labelA, labelB);
}

function createLabel(name, color, xPosition) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, canvas.width / 2, 48);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3, 1.5, 1);
  sprite.name = name;
  sprite.position.set(xPosition, 8, -25);

  sprite.updateCtx = ctx;
  sprite.updateCanvas = canvas;
  sprite.texture = texture;

  scene.add(sprite);
  return sprite;
}

function onCanvasClick(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([labelA, labelB]);

  if (intersects.length > 0 && !isKicked && ball) {
    const clickedLabel = intersects[0].object.name;
    const direction = new THREE.Vector3().subVectors(intersects[0].object.position, ball.position).normalize();

    velocity.copy(direction.multiplyScalar(0.5));
    elevation = ball.position.y;
    elevationSpeed = 1.5;
    isKicked = true;

    checkAnswerFromLabelHit(clickedLabel);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);
  updateGameLogic();
  renderer.render(scene, camera);
  updateConfetti();
}

function updateGameLogic() {
  if (!isKicked && player && ball) {
    player.position.x = THREE.MathUtils.clamp(player.position.x + moveDir * 0.1, -5, 5);
    resetBallPosition();
  } else if (isKicked && ball) {
    if (ball.position.z < -10 && !isSlowMotion) {
      isSlowMotion = true;
      velocity.multiplyScalar(0.3);
    }

    ball.position.add(velocity);
    ball.position.y = 0.2;

    if (cinematicProgress < 1) {
      cinematicProgress += isSlowMotion ? 0.003 : 0.01;
      const targetCamPos = new THREE.Vector3(
        ball.position.x,
        5 + cinematicProgress * 3,
        ball.position.z + 8 - cinematicProgress * 6
      );
      camera.position.lerp(targetCamPos, isSlowMotion ? 0.02 : 0.05);
      camera.lookAt(ball.position);
    }

    if (ball.position.z < -20) {
      isKicked = false;
      isSlowMotion = false;
      cinematicProgress = 0;
      velocity.set(0, 0, 0);
      createConfetti();
      resetBallPosition();
      resetCamera();
    }

  }
}

function generateQuestion(level = 1) {
  const data = questions[level];
  const isCorrectLeft = Math.random() < 0.5;
  const [correct, wrong] = data.jawaban[0] === data.benar ? data.jawaban : [data.jawaban[1], data.jawaban[0]];

  currentQuestion = {
    question: data.soal,
    correctAnswer: data.benar,
    options: isCorrectLeft ? [correct, wrong] : [wrong, correct],
    correctLabel: isCorrectLeft ? "A" : "B"
  };
}

function updateQuestionUI() {
  console.log("updateQuestionUI called");
  console.log("currentQuestion:", currentQuestion);
  questionText.textContent = currentQuestion.question || "SOAL KOSONG!";
  updateLabelTextures();
}

function checkAnswerFromLabelHit(hitLabel) {
  const isCorrect = hitLabel === currentQuestion.correctLabel;
  if (isCorrect) {
    score++;
    updateScoreUI();
  }
  currentLevel = Math.min(5, Math.floor(score / 1) + 1);
  generateQuestion(currentLevel);
  updateQuestionUI();
}

function updateLabelTextures() {
  if (!labelA || !labelB) return;
  [labelA, labelB].forEach((label, i) => {
    const ctx = label.updateCtx;
    const canvas = label.updateCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = i === 0 ? "#1900FF" : "#FF0040";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(currentQuestion.options[i], canvas.width / 2, 48);
    label.texture.needsUpdate = true;
  });
}

function updateScoreUI() {
  document.getElementById("score").textContent = score;
}

function createConfetti() {
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

  confettiMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
  confetti = new THREE.Points(confettiGeometry, confettiMaterial);
  scene.add(confetti);
  isCelebrating = true;

  setTimeout(() => {
    removeConfetti();
    endLevel(); // Tambahkan ini
  }, 5000);
}

function endLevel() {
  gameState = "intro";

  // Sembunyikan canvas
  canvas.style.display = "none";

  // Munculkan soal dan tombol
  questionBox.style.display = "block";
  startBox.style.display = "block";

  // Ganti tombol jadi "Next Level"
  startBtn.textContent = "Next Level";

  // Update soal untuk level berikutnya
  generateQuestion(currentLevel);
  updateQuestionUI();
}

function updateConfetti() {
  if (!isCelebrating || !confetti) return;

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

function removeConfetti() {
  if (confetti) {
    scene.remove(confetti);
    confetti.geometry.dispose();
    confetti.material.dispose();
    confetti = null;
    isCelebrating = false;
  }
}

// Tambahkan ini di akhir JS file
document.addEventListener("DOMContentLoaded", () => {
  questionBox.style.display = "block";  // opsional, jika sempat di-hide
  generateQuestion(currentLevel);
  updateQuestionUI();
});

