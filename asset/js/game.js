window.addEventListener("DOMContentLoaded", () => {
  // === Scene Setup ===
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3.5, 10);  // Lebih tinggi agar full-body terlihat
  camera.lookAt(0, 2, 0);           // Fokus ke tengah tubuh pemain

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

  // === Fungsi Membuat Sprite Karakter 2D dari Gambar ===
  function createCartoonPlayer() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("../images/player.png"); // Pastikan file player.png tersedia
    texture.flipY = false;

    // Jika ingin membelakangi kamera, mirror horizontal
    texture.repeat.x = -1;
    texture.offset.x = 1;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 4, 1); // Lebar, tinggi, depth semu

    return sprite;
  }

  const player = createCartoonPlayer();
  player.position.set(0, 2, 10); // Posisi agar sejajar kaki di bawah dan kamera lihat dari belakang
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
        // bisa tambahkan scaling animasi jika mau "tendang"
        player.scale.y = 3.8; // pendek sebentar
        setTimeout(() => player.scale.y = 4, 100);
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
      velocity.y -= 0.008;
    }

    renderer.render(scene, camera);
  }

  animate();
});
