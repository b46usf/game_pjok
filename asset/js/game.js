window.addEventListener("DOMContentLoaded", () => {
  // === Scene Setup ===
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2.5, 10);
  camera.lookAt(0, 1.2, 0);

  const canvas = document.getElementById("gameCanvas");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // === Lighting ===
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // === Fungsi Membuat Karakter Kartun ===
  function createCartoonPlayer() {
    const player = new THREE.Group();

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x8d5524 }) // kulit
    );
    head.position.set(0, 2.6, 0);
    player.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x5d3a1a }) // rambut
    );
    hair.position.set(0, 2.85, 0);
    player.add(hair);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3498db }) // biru
    );
    body.position.set(0, 1.6, 0);
    player.add(body);

    const shorts = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xe74c3c }) // merah
    );
    shorts.position.set(0, 1.2, 0);
    player.add(shorts);

    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffe0bd });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6), legMaterial);
    const rightLeg = leftLeg.clone();
    leftLeg.position.set(-0.2, 0.6, 0);
    rightLeg.position.set(0.2, 0.6, 0);
    player.add(leftLeg);
    player.add(rightLeg);

    const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.6), shoeMaterial);
    const rightShoe = leftShoe.clone();
    leftShoe.position.set(-0.2, 0.2, 0.15);
    rightShoe.position.set(0.2, 0.2, 0.15);
    player.add(leftShoe);
    player.add(rightShoe);

    return player;
  }

  const player = createCartoonPlayer();
  player.position.set(0, 0, 10);
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

  // === Kontrol Keyboard (Gerakkan bola sebelum ditendang) ===
  let moveDir = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    else if (e.key === "ArrowRight") moveDir = 1;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") moveDir = 0;
  });

  // === Tembakan Bola ===
  let isKicked = false;
  let velocity = new THREE.Vector3();

  const shootBtn = document.getElementById("shootBtn");
  if (shootBtn) {
    shootBtn.addEventListener("click", () => {
      if (!isKicked) {
        isKicked = true;
        velocity.set(0, 0.1, -0.4);
        // animasi pemain saat menendang
        player.rotation.y = 0;
        player.rotation.x = -0.3;
      }
    });
  }

  // === Game Loop ===
  function animate() {
    requestAnimationFrame(animate);

    if (!isKicked) {
      ball.position.x += moveDir * 0.1;
      player.position.x += moveDir * 0.1;
      ball.position.x = THREE.MathUtils.clamp(ball.position.x, -5, 5);
      player.position.x = THREE.MathUtils.clamp(player.position.x, -5, 5);
    } else {
      ball.position.add(velocity);
      velocity.y -= 0.008; // gravitasi
    }

    renderer.render(scene, camera);
  }

  animate();
});
