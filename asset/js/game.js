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

const questions = {
  1: { soal: "Angka Genap", jawaban: ["2", "3"], benar: "2" },
  2: { soal: "Bilangan Prima", jawaban: ["4", "5"], benar: "5" },
  3: { soal: "Kelipatan 3", jawaban: ["6", "7"], benar: "6" },
  4: { soal: "Lebih besar dari 5", jawaban: ["4", "6"], benar: "6" },
  5: { soal: "Kurang dari 10", jawaban: ["12", "8"], benar: "8" }
};

// === DOM Elements ===
const canvas = document.getElementById("gameCanvas");
const startBtn = document.getElementById("startBtn");
const questionBox = document.getElementById("questionBox");
const startBox = document.getElementById("startBox");
const scoreBox = document.querySelector('[id="score"]').parentElement.parentElement;
const questionText = document.getElementById("questionText");

// === UI Setup ===
scoreBox.style.display = "none";
canvas.style.display = "none";
questionText.textContent = "Angka Genap";

// === Event Listeners ===
startBtn.addEventListener("click", () => {
  questionBox.style.display = "none";
  startBox.style.display = "none";
  scoreBox.style.display = "block";
  canvas.style.display = "block";
  init();
  animate();
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener("mousedown", (event) => {
  // Hitung posisi mouse dalam normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([labelA, labelB]);

  if (intersects.length > 0 && !isKicked && ball) {
    const clickedLabel = intersects[0].object.name;

    // Hitung arah tendangan ke label
    const target = intersects[0].object.position.clone();
    const direction = new THREE.Vector3().subVectors(target, ball.position).normalize();

    velocity.copy(direction.multiplyScalar(0.5)); // Sesuaikan kecepatan bola
    elevation = ball.position.y;
    elevationSpeed = 1.5; // Kekuatan tendangan vertikal
    isKicked = true;

    // Simpan label yang ditendang untuk verifikasi jawaban
    checkAnswerFromLabelHit(clickedLabel);
  }
});

window.addEventListener("resize", () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveDir = -1;
  else if (e.key === "ArrowRight") moveDir = 1;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") moveDir = 0;
});

// === Initialization ===
function init() {
  setupScene();
  setupCamera();
  setupRenderer();
  setupLighting();
  loadPlayer();
  loadGoals();
  createLabels();
  generateQuestion(1);
  updateQuestionUI();
}

function setupScene() {
  scene = new THREE.Scene();
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 15);
  camera.lookAt(0, 0, 0);
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupLighting() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
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

function loadGoals() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("asset/image/goal.png", (goalTexture) => {
    const goalMaterial = new THREE.MeshBasicMaterial({
      map: goalTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const goal1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), goalMaterial);
    goal1.position.set(10, 4, -20);
    scene.add(goal1);

    const goal2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), goalMaterial.clone());
    goal2.position.set(-10, 4, -20);
    scene.add(goal2);
  });
}

function createLabels() {
  function createLabelSprite(text, color) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 128;
    canvas.height = 64;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, 48);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 1.5, 1);
    return { sprite, texture, canvas, ctx };
  }

  // Label A (kiri)
  const labelAObj = createLabelSprite("A", "#27ae60");
  labelA = labelAObj.sprite;
  labelA.name = "A";
  labelA.position.set(-10, 8, -25);
  scene.add(labelA);

  // Label B (kanan)
  const labelBObj = createLabelSprite("B", "#8e44ad");
  labelB = labelBObj.sprite;
  labelB.name = "B";
  labelB.position.set(10, 8, -25);
  scene.add(labelB);

  // Simpan akses ke update context jika ingin update texture secara dinamis
  labelA.updateCtx = labelAObj.ctx;
  labelA.updateCanvas = labelAObj.canvas;
  labelA.texture = labelAObj.texture;

  labelB.updateCtx = labelBObj.ctx;
  labelB.updateCanvas = labelBObj.canvas;
  labelB.texture = labelBObj.texture;
}

// === Animation ===
function animate() {
  animationId = requestAnimationFrame(animate);
  updateGameLogic();
  renderer.render(scene, camera);
}

function updateGameLogic() {
  if (!isKicked && player) {
    // Gerak kanan-kiri player
    player.position.x += moveDir * 0.1;
    player.position.x = THREE.MathUtils.clamp(player.position.x, -5, 5);

    // Jika bola ada, posisinya ikut player (depan kaki kanan)
    if (ball) {
      const offsetX = 0.3;
      const offsetY = 0.2;
      const offsetZ = 1;
      ball.position.set(player.position.x + offsetX, offsetY, player.position.z - offsetZ);
      ball.scale.set(1, 1, 1); // Ukuran bola stabil
    }
  } 

  if (isKicked && ball) {
    // Aktifkan slow motion jika bola dekat gawang
    if (ball.position.z < -10 && !isSlowMotion) {
      isSlowMotion = true;
      velocity.multiplyScalar(0.3); // perlambat gerak bola
    }

    // Gerakkan bola
    ball.position.x += velocity.x;
    ball.position.z += velocity.z;
    ball.position.y = 0.2;

    // Efek kamera cinematic
    if (cinematicProgress < 1) {
      cinematicProgress += isSlowMotion ? 0.003 : 0.01; // slowmo = gerak lebih lambat

      const targetCamPos = new THREE.Vector3(
        ball.position.x,
        5 + cinematicProgress * 3,
        ball.position.z + 8 - cinematicProgress * 6
      );

      camera.position.lerp(targetCamPos, isSlowMotion ? 0.02 : 0.05);
      camera.lookAt(ball.position);
    }

    // Jika bola sudah sangat jauh
    if (ball.position.z < -20) {
      isKicked = false;
      isSlowMotion = false;
      cinematicProgress = 0;
      velocity.set(0, 0, 0);

      // Reset posisi bola
      const offsetX = 0.3;
      const offsetY = 0.2;
      const offsetZ = 1;
      ball.position.set(player.position.x + offsetX, offsetY, player.position.z - offsetZ);

      // Reset kamera
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);
    }
  }

}

function generateQuestion(level = 1) {
  const data = questions[level];
  const isCorrectLeft = Math.random() < 0.5;
  const correctIndex = data.jawaban.indexOf(data.benar);
  const wrongIndex = correctIndex === 0 ? 1 : 0;

  currentQuestion = {
    question: data.soal,
    correctAnswer: data.benar,
    options: isCorrectLeft
      ? [data.jawaban[correctIndex], data.jawaban[wrongIndex]]
      : [data.jawaban[wrongIndex], data.jawaban[correctIndex]],
    correctLabel: isCorrectLeft ? "A" : "B"
  };
}

function updateQuestionUI() {
  questionText.textContent = currentQuestion.question;
  updateLabelTextures();
}

function checkAnswerFromLabelHit(hitLabel) {
  const isCorrect = hitLabel === currentQuestion.correctLabel;

  if (isCorrect) {
    score += 1;
    updateScoreUI();
  }

  // Ganti soal baru
  currentLevel = Math.min(5, Math.floor(score / 1) + 1);
  generateQuestion(currentLevel);
  updateQuestionUI();
}

function updateLabelTextures() {
  const options = currentQuestion.options;

  [labelA, labelB].forEach((label, index) => {
    const ctx = label.updateCtx;
    const canvas = label.updateCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = index === 0 ? "#1900FFFF" : "#FF0040FF"; // Sesuaikan warna
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(options[index], canvas.width / 2, 48);
    label.texture.needsUpdate = true;
  });
}

function createBall() {
  const geometry = new THREE.SphereGeometry(0.3, 32, 32);
  const texture = new THREE.TextureLoader().load("asset/image/soccer-ball.png");
  const material = new THREE.MeshStandardMaterial({ map: texture });

  ball = new THREE.Mesh(geometry, material);

  // Arahkan bola ke depan kanan player
  const offsetX = 0.3;   // ke kanan (dari kaki kanan)
  const offsetY = 0.2;    // setinggi kaki
  const offsetZ = 1;   // sedikit di depan player
  ball.position.set(player.position.x + offsetX, offsetY, player.position.z - offsetZ); 

  scene.add(ball);
}

function updateScoreUI() {
  document.getElementById("score").textContent = score;
}
