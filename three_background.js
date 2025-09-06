/**
 * Simple, lightweight Three.js animated particle background.
 * Uses module import from unpkg CDN.
 *
 * Important: This file is a module and expects to be loaded with type="module".
 */
import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";

const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

// Particles geometry
const particleCount = 2200;
const positions = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  // spread in a wide area
  positions[i3 + 0] = (Math.random() - 0.5) * 30;
  positions[i3 + 1] = (Math.random() - 0.5) * 12;
  positions[i3 + 2] = (Math.random() - 0.5) * 30;
  sizes[i] = Math.random() * 3 + 0.5;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// Points material
const material = new THREE.ShaderMaterial({
  transparent: true,
  depthTest: false,
  uniforms: {
    uTime: { value: 0.0 },
    uPixelRatio: { value: window.devicePixelRatio || 1.0 }
  },
  vertexShader: `
    attribute float size;
    uniform float uTime;
    varying float vOpacity;
    void main(){
      vOpacity = 0.6 + 0.4 * sin(uTime * 0.5 + position.y * 0.2);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z) ;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying float vOpacity;
    void main(){
      float r = length(gl_PointCoord - vec2(0.5));
      float alpha = smoothstep(0.5, 0.48, r);
      gl_FragColor = vec4(0.85, 0.95, 0.9, alpha * vOpacity * 0.85);
    }
  `
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// subtle rotation and parallax based on mouse
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// Resize handling
function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize, false);

let clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  material.uniforms.uTime.value = t;

  // slow rotation + parallax
  points.rotation.y = t * 0.03 + mouseX * 0.3;
  points.rotation.x = mouseY * 0.1;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

