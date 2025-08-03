// === Scene ===
function setupScene() {
  scene = new THREE.Scene();
}

// === Camera ===
function setupCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  resetCamera();
}

function resetCamera() {
  if (!camera) return;
  camera.position.copy(DEFAULT_CAMERA_POS);
  camera.lookAt(new THREE.Vector3(0, 1.5, 0)); // Fokus ke pemain
}

// === Renderer ===
function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// === Lighting ===
function setupLighting() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
}

// === Player ===
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

// === Ball ===
function createBall() {
  const geometry = new THREE.SphereGeometry(0.3, 32, 32);
  const texture = new THREE.TextureLoader().load("asset/image/soccer-ball.png");
  const material = new THREE.MeshStandardMaterial({ map: texture });
  ball = new THREE.Mesh(geometry, material);
  resetBallPosition();
  scene.add(ball);
}

function resetBallPosition() {
  if (!ball || !player) return;
  ball.position.set(player.position.x + 0.3, 0.2, player.position.z - 1);
}

// === Goal ===
function loadGoals() {
  const loader = new THREE.TextureLoader();
  loader.load("asset/image/goal.png", (goalTexture) => {
    const material = new THREE.MeshBasicMaterial({
      map: goalTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    goal1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), material);
    goal1.position.set(10, 4, -20);
    scene.add(goal1);

    goal2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), material.clone());
    goal2.position.set(-10, 4, -20);
    scene.add(goal2);
  });
}

// === Labels ===
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

  drawLabelToCanvas(ctx, name, color);

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