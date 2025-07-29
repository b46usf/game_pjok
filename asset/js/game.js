window.addEventListener("DOMContentLoaded", () => {
  // === Scene Setup ===
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2.8, 12);  // 📌 Mundur dan agak rendah
  camera.lookAt(0, 1.6, 0);         // 📌 Fokus ke tengah badan pemain

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

  // === Sprite Karakter 2D ===
  let player;

  const loader = new THREE.TextureLoader();
  loader.load(
    "asset/image/player.png",
    (texture) => {
      console.log("✅ Gambar berhasil dimuat");

      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });

      player = new THREE.Sprite(material);
      player.scale.set(1.5, 3, 1);         // 📌 Ukuran tubuh full
      player.position.set(0, 1.5, 8);      // 📌 Pasin kaki ke bawah
      scene.add(player);
    },
    undefined,
    (error) => {
      console.error("❌ Gagal memuat gambar:", error);
    }
  );

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

  // === Kontrol Keyboard (Gerak horizontal sebelum ditendang) ===
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
      if (!isKicked && player) {
        isKicked = true;
        velocity.set(0, 0.1, -0.4);
        player.scale.y = 2.8; // animasi kecil
        setTimeout(() => player.scale.y = 3, 100);
      }
    });
  }

  // === Game Loop ===
  function animate() {
    requestAnimationFrame(animate);

    if (!isKicked) {
      ball.position.x += moveDir * 0.1;
      if (player) player.position.x += moveDir * 0.1;

      ball.position.x = THREE.MathUtils.clamp(ball.position.x, -5, 5);
      if (player) player.position.x = THREE.MathUtils.clamp(player.position.x, -5, 5);
    } else {
      ball.position.add(velocity);
      velocity.y -= 0.008;
    }

    renderer.render(scene, camera);
  }

  animate();
});
