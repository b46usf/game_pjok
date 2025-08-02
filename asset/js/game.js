// === Global Variables ===
let scene, camera, renderer;
let player, ball;
let moveDir = 0, isKicked = false;
let velocity = new THREE.Vector3();
let elevation = 0;
let elevationSpeed = 0;
const gravity = 0.4;
let animationId;

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
  camera.position.set(0, 2.8, 12);
  camera.lookAt(0, 1.6, 0);
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
  function createLabel(text, color) {
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
    return sprite;
  }

  const label3 = createLabel("3", "#c0392b");
  label3.position.set(10, 8, -25);
  scene.add(label3);

  const label4 = createLabel("4", "#2980b9");
  label4.position.set(-10, 8, -25);
  scene.add(label4);
}

// === Animation ===
function animate() {
  animationId = requestAnimationFrame(animate);
  updateGameLogic();
  renderer.render(scene, camera);
}

function updateGameLogic() {
  if (!isKicked && player) {
    player.position.x += moveDir * 0.1;
    player.position.x = THREE.MathUtils.clamp(player.position.x, -5, 5);
  } else if (ball) {
    ball.position.x += velocity.x;
    ball.position.z += velocity.z;

    elevationSpeed -= gravity * 0.1;
    elevation += elevationSpeed * 0.1;
    ball.position.y = Math.max(0.5, elevation);

    if (elevation <= 0.5 && elevationSpeed < 0) {
      isKicked = false;
      elevationSpeed = 0;
      velocity.set(0, 0, 0);
    }
  }
}

// === Optional Shoot Mechanism ===
// Tambahkan event listener shootBtn jika diperlukan
// dan arahkan ke target label (ex: label4)
