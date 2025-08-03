import { DEFAULT_CAMERA_POS } from './gameCore.js';

export let scene, camera, renderer;

export function setupScene(canvas) {
  if (!canvas) throw new Error("Canvas tidak ditemukan!");
  scene = new THREE.Scene();
  setupCamera();
  setupRenderer(canvas);
  setupLighting();
  return { scene, camera, renderer };
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  resetCamera();
}

export function resetCamera() {
  if (!camera) return;
  camera.position.copy(DEFAULT_CAMERA_POS);
  camera.lookAt(new THREE.Vector3(0, 1.5, 0));
}

function setupRenderer(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupLighting() {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
}

export function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }
