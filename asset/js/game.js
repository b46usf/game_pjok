window.addEventListener("DOMContentLoaded", () => {
  // === Setup Scene, Camera, Renderer ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2.8, 12);
  camera.lookAt(0, 1.6, 0);

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

  // === Sprite Player ===
  let player;
  const loader = new THREE.TextureLoader();
  loader.load("asset/image/player.png", (texture) => {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    player = new THREE.Sprite(material);
    player.scale.set(1.5, 3, 1);
    player.position.set(0, 1.5, 6);
    scene.add(player);
  });

  // === Gawang + Label Angka ===
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("asset/image/goal.png", (goalTexture) => {
    const goalMaterial = new THREE.MeshBasicMaterial({
      map: goalTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const goal1 = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 7), // Lebar dan tinggi gawang
      goalMaterial
    );
    goal1.position.set(10, 4, -20);
    // goal1.rotation.y = -Math.PI / 2; // Menghadap ke kiri
    scene.add(goal1);

    const goal2 = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 7),
      goalMaterial.clone()
    );
    goal2.position.set(-10, 4, -20);
    // goal2.rotation.y = Math.PI / 2; // Menghadap ke kanan
    scene.add(goal2);
  });

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

  // === Kontrol Pemain ===
  let moveDir = 0;
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    else if (e.key === "ArrowRight") moveDir = 1;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") moveDir = 0;
  });

  // === Bola ===
  let ball, isKicked = false;
  let velocity = new THREE.Vector3();
  let elevation = 0;
  let elevationSpeed = 0;
  const gravity = 0.4;

  // === Tembakan ===
  const shootBtn = document.getElementById("shootBtn");
  shootBtn.addEventListener("click", () => {
    if (!isKicked && player) {
      isKicked = true;
      player.scale.y = 2.8;
      setTimeout(() => player.scale.y = 3, 100);

      ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      ball.position.set(player.position.x, 0.5, player.position.z);
      elevation = 0.5;
      elevationSpeed = 2.5;
      scene.add(ball);

      // Arah ke label4
      const from = new THREE.Vector3(ball.position.x, 0, ball.position.z);
      const to = new THREE.Vector3(label4.position.x, 0, label4.position.z);
      const dir = new THREE.Vector3().subVectors(to, from).normalize();
      velocity.copy(dir.multiplyScalar(1.5)); // Power horizontal
    }
  });

  // === Game Loop ===
  function animate() {
    requestAnimationFrame(animate);

    if (!isKicked) {
      if (player) {
        player.position.x += moveDir * 0.1;
        player.position.x = THREE.MathUtils.clamp(player.position.x, -5, 5);
      }
    } else {
      if (ball) {
        ball.position.x += velocity.x;
        ball.position.z += velocity.z;

        elevationSpeed -= gravity * 0.1;
        elevation += elevationSpeed * 0.1;
        ball.position.y = Math.max(0.5, elevation);

        // Hentikan jika bola menyentuh tanah
        if (elevation <= 0.5 && elevationSpeed < 0) {
          isKicked = false;
          elevationSpeed = 0;
          velocity.set(0, 0, 0);
        }
      }
    }

    renderer.render(scene, camera);
  }

  animate();
});
