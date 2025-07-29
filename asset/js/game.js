// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

window.addEventListener("DOMContentLoaded", () => {
  // === Scene Setup ===
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("gameCanvas"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === Lighting ===
  scene.add(new THREE.DirectionalLight(0xffffff, 1).position.set(10, 10, 10));
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // === Lapangan ===
  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 30),
    new THREE.MeshLambertMaterial({ color: 0x4caf50 })
  );
  grass.rotation.x = -Math.PI / 2;
  scene.add(grass);

  // Garis tengah
  const midLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.set(0, 0.01, 0);
  scene.add(midLine);

  // Lingkaran tengah
  const ring = new THREE.RingGeometry(3.5, 3.55, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const ringMesh = new THREE.Mesh(ring, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.02;
  scene.add(ringMesh);

  // === Awan Kartun ===
  function createCloud(x, y, z) {
    const cloud = new THREE.Group();
    const geo = new THREE.SphereGeometry(1.5, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(geo, mat);
      puff.position.x = i * 1.2;
      cloud.add(puff);
    }
    cloud.position.set(x, y, z);
    scene.add(cloud);
  }

  createCloud(-5, 7, -5);
  createCloud(5, 6, -6);
  createCloud(0, 6.5, -8);

  // === Pohon Sederhana ===
  function createTree(x, z) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
    );
    trunk.position.set(x, 0.5, z);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
    );
    crown.position.set(x, 1.6, z);

    scene.add(trunk);
    scene.add(crown);
  }

  for (let i = -10; i <= 10; i += 2) {
    createTree(i, -14);
  }

  // === Karakter Kartun ===
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xffcc00 })
  );
  player.position.set(0, 1, 10);
  scene.add(player);

  // === Bola ===
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  ball.position.set(0, 0.5, 8);
  scene.add(ball);

  // === Gawang + Label Angka ===
  const goal1 = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xff6666 })
  );
  goal1.position.set(4, 1, -10);
  scene.add(goal1);

  const goal2 = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x66ccff })
  );
  goal2.position.set(-4, 1, -10);
  scene.add(goal2);

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
  label3.position.set(4, 2.5, -9.6);
  scene.add(label3);

  const label4 = createLabel("4", "#2980b9");
  label4.position.set(-4, 2.5, -9.6);
  scene.add(label4);

  // === Kontrol Keyboard ===
  let moveDir = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    else if (e.key === "ArrowRight") moveDir = 1;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") moveDir = 0;
  });

  // === Bola Movement ===
  let isKicked = false;
  let velocity = new THREE.Vector3();

  document.getElementById("shootBtn").addEventListener("click", () => {
    if (!isKicked) {
      isKicked = true;
      velocity.set(0, 0.1, -0.4);
    }
  });

  // === Game Loop ===
  function animate() {
    requestAnimationFrame(animate);

    if (!isKicked) {
      ball.position.x += moveDir * 0.1;
      ball.position.x = THREE.MathUtils.clamp(ball.position.x, -5, 5);
    } else {
      ball.position.add(velocity);
      velocity.y -= 0.008;
    }

    renderer.render(scene, camera);
  }

  animate();
});
