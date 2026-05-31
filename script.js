import * as THREE from 'three';

const canvas = document.querySelector('#salon-scene');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 1.25, 7.4);
scene.add(camera);

const group = new THREE.Group();
scene.add(group);

const ambient = new THREE.AmbientLight(0xffd7ef, 1.6);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(3, 5, 5);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0xff62b2, 55, 10);
rim.position.set(-3, 2.3, 3);
scene.add(rim);

function makeBottle(color, x, scale = 1) {
  const bottle = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.18,
    metalness: 0.05,
    transmission: 0.2,
    thickness: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x14081a, roughness: 0.28, metalness: 0.45 });
  const labelMat = new THREE.MeshStandardMaterial({ color: 0xfff2fa, roughness: 0.34, metalness: 0.05 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.45, 9, 22), bodyMat);
  body.scale.set(1, 1.08, 0.72);
  body.castShadow = true;
  body.receiveShadow = true;
  bottle.add(body);

  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.52, 0.32, 32), bodyMat);
  shoulder.position.y = 0.9;
  bottle.add(shoulder);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 1.28, 32), capMat);
  cap.position.y = 1.58;
  cap.castShadow = true;
  bottle.add(cap);

  const brushTop = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.028, 12, 32), labelMat);
  brushTop.position.y = 2.25;
  brushTop.rotation.x = Math.PI / 2;
  bottle.add(brushTop);

  const label = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.42, 0.04), labelMat);
  label.position.set(0, -0.08, 0.47);
  bottle.add(label);

  bottle.position.x = x;
  bottle.scale.setScalar(scale);
  return bottle;
}

const bottles = [
  makeBottle(0xff4fa2, -1.55, 0.96),
  makeBottle(0xeec8ff, 0, 1.14),
  makeBottle(0x8c52ff, 1.55, 0.96),
];
bottles.forEach((bottle, index) => {
  bottle.rotation.z = (index - 1) * -0.12;
  group.add(bottle);
});

const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(2.9, 3.25, 0.32, 96),
  new THREE.MeshStandardMaterial({ color: 0x3a1948, metalness: 0.15, roughness: 0.28 })
);
platform.position.y = -1.35;
platform.receiveShadow = true;
group.add(platform);

const gemMat = new THREE.MeshStandardMaterial({ color: 0xf8d78f, roughness: 0.16, metalness: 0.7 });
const gems = Array.from({ length: 34 }, (_, i) => {
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.055 + Math.random() * 0.05), gemMat);
  const angle = (i / 34) * Math.PI * 2;
  const radius = 2.65 + Math.sin(i) * 0.24;
  gem.position.set(Math.cos(angle) * radius, -1.05 + Math.random() * 0.28, Math.sin(angle) * radius * 0.4);
  gem.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  group.add(gem);
  return gem;
});

const pointer = new THREE.Vector2(0, 0);
window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  const glow = document.querySelector('.cursor-glow');
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

function resize() {
  const { clientWidth, clientHeight } = canvas.parentElement;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();
  group.rotation.y += (pointer.x * 0.28 - group.rotation.y) * 0.045;
  group.rotation.x += (-pointer.y * 0.09 - group.rotation.x) * 0.045;
  bottles.forEach((bottle, index) => {
    bottle.position.y = Math.sin(elapsed * 1.3 + index) * 0.08;
    bottle.rotation.y = Math.sin(elapsed * 0.7 + index) * 0.08;
  });
  gems.forEach((gem, index) => {
    gem.rotation.x += 0.01 + index * 0.0002;
    gem.rotation.y += 0.014;
  });
  rim.position.x = -3 + pointer.x * 2;
  rim.position.y = 2.3 - pointer.y;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('#nav-links');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
navLinks.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
});

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    card.style.transform = `perspective(850px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(850px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});

const lookOutput = document.querySelector('.look-output strong');
document.querySelectorAll('.look-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.look-card').forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    lookOutput.textContent = card.dataset.look;
  });
});

document.querySelector('.booking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get('name') || 'Beautiful guest';
  document.querySelector('.form-message').textContent = `Thanks, ${name}! Your appointment request is ready for salon confirmation.`;
  event.currentTarget.reset();
});
