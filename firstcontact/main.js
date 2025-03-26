import * as THREE from './three/build/three.module.js';
import { PointerLockControls } from './three/examples/jsm/controls/PointerLockControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Resize support
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 10, 10);
scene.add(light);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshLambertMaterial({ color: 0x228B22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Alien
const alien = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshLambertMaterial({ color: 0x39FF14 })
);
alien.position.set(0, 1, -10);
scene.add(alien);
let alienHealth = 200;

// Gun
const gun = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.2, 1),
  new THREE.MeshBasicMaterial({ color: 0x444444 })
);
gun.position.set(0.5, -0.5, -1);
camera.add(gun);

// PointerLock controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.body.addEventListener('click', () => controls.lock());

// Movement
const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Shooting
let bullets = [];
let isFiring = false;
let lastShot = 0;
const fireRate = 0.2;
const bulletSpeed = 1;
const bulletDamage = 5;

document.addEventListener('mousedown', () => isFiring = true);
document.addEventListener('mouseup', () => isFiring = false);

function shootBullet() {
  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  bullet.position.copy(camera.position);
  bullet.direction = new THREE.Vector3();
  camera.getWorldDirection(bullet.direction);
  scene.add(bullet);
  bullets.push(bullet);
}

// Animation
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const now = performance.now() / 1000;

  // Movement
  const speed = 5 * delta;
  if (keys['w']) controls.moveForward(speed);
  if (keys['s']) controls.moveForward(-speed);
  if (keys['a']) controls.moveRight(-speed);
  if (keys['d']) controls.moveRight(speed);

  // Firing
  if (isFiring && now - lastShot > fireRate) {
    shootBullet();
    lastShot = now;
  }

  // Bullet movement and alien hit detection
  bullets.forEach((bullet, i) => {
    bullet.position.add(bullet.direction.clone().multiplyScalar(bulletSpeed));
    const dist = bullet.position.distanceTo(alien.position);
    if (dist < 1 && alienHealth > 0) {
      alienHealth -= bulletDamage;
      scene.remove(bullet);
      bullets.splice(i, 1);
      if (alienHealth <= 0) {
        scene.remove(alien);
        document.getElementById('message').style.display = 'block';
      }
    }
    if (bullet.position.length() > 1000) {
      scene.remove(bullet);
      bullets.splice(i, 1);
    }
  });

  renderer.render(scene, camera);
}
animate();

