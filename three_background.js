/**
 * three_background.js
 * Torus-knot (torsion knot) background — performant and pretty.
 *
 * Usage: load as a module (type="module" in index.html)
 *
 * Optimizations:
 * - capped devicePixelRatio
 * - modest geometry resolution (configurable)
 * - single lightweight shader + Mesh
 * - no expensive postprocessing or huge attribute buffers
 */

import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";

const canvas = document.getElementById("bg");

// Renderer: alpha=true so the page background still shows through if desired
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false, // cheaper
  alpha: true,
  powerPreference: "low-power",
});
renderer.setClearColor(0x000000, 0); // transparent background
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // cap DPR for perf
renderer.setSize(window.innerWidth, window.innerHeight, false);

// Scene + camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 8;

// Light (very cheap)
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
scene.add(hemi);

// Parameters (tweak these for higher/lower detail)
const PARAMS = {
  radius: 1.8,
  tube: 0.45,
  tubularSegments: 160,   // along length (keep moderate)
  radialSegments: 24,     // cross-section detail (keep low-to-medium)
  p: 2,
  q: 3,
  scale: 1.8,
  rotationSpeed: 0.18,    // overall rotation speed
  colorA: new THREE.Color(0xffa500), // gradient top-ish color
  colorB: new THREE.Color(0xff8c00), // gradient bottom-ish color
};

// Geometry (torus knot)
const geometry = new THREE.TorusKnotGeometry(
  PARAMS.radius,
  PARAMS.tube,
  PARAMS.tubularSegments,
  PARAMS.radialSegments,
  PARAMS.p,
  PARAMS.q
);

// Custom shader material — gives a soft color gradient driven by normals
const material = new THREE.ShaderMaterial({
  uniforms: {
    uColorA: { value: PARAMS.colorA },
    uColorB: { value: PARAMS.colorB },
    uTime: { value: 0.0 },
    uScale: { value: PARAMS.scale },
  },
  vertexShader: `varying vec3 vNormal;
                 varying vec3 vPos;
                 void main(){
                   vNormal = normalize(normalMatrix * normal);
                   vPos = position;
                   gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                 }`,
  fragmentShader: `uniform vec3 uColorA;
                   uniform vec3 uColorB;
                   uniform float uTime;
                   varying vec3 vNormal;
                   varying vec3 vPos;

                   // simple pastel rim + gradient
                   void main(){
                     float rim = 1.0 - max(0.0, dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
                     float stripe = 0.5 + 0.5 * sin(vPos.y * 3.0 + uTime * 0.6);
                     vec3 base = mix(uColorA, uColorB, smoothstep(-1.5, 1.5, vPos.y * 0.5));
                     vec3 color = base * (0.9 + 0.25 * stripe) + rim * 0.08;
                     gl_FragColor = vec4(color, 0.96);
                   }`,
  transparent: true,
  depthWrite: false,
  depthTest: true,
  // keep side front/back so knot is fully visible from all angles
  side: THREE.DoubleSide,
});

// Create mesh and add to scene
const knot = new THREE.Mesh(geometry, material);
knot.scale.setScalar(PARAMS.scale);
scene.add(knot);

// subtle duplicates for depth (cheap)
const duplicate = knot.clone();
duplicate.scale.setScalar(PARAMS.scale * 0.985);
duplicate.material = material.clone();
duplicate.material.uniforms = material.uniforms;
duplicate.material.uniforms.uColorA.value = new THREE.Color(0xffd700);
duplicate.material.uniforms.uColorB.value = new THREE.Color(0xffa07a);
duplicate.material.transparent = true;
duplicate.material.opacity = 0.7;
scene.add(duplicate);

// Mouse parallax
let mouseX = 0, mouseY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

// Touch support (for mobile)
window.addEventListener("touchmove", (e) => {
  if (!e.touches || e.touches.length === 0) return;
  const t = e.touches[0];
  mouseX = (t.clientX / window.innerWidth) * 2 - 1;
  mouseY = (t.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

// Resize handling
function onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  // maintain pixel ratio cap on resize
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
}
window.addEventListener("resize", onWindowResize, false);

// Animation
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  material.uniforms.uTime.value = t;

  // gentle autonomous rotation
  const baseRot = t * PARAMS.rotationSpeed * 0.25;
  knot.rotation.y = baseRot;
  knot.rotation.x = Math.sin(t * 0.15) * 0.15;

  duplicate.rotation.y = baseRot * 1.03;
  duplicate.rotation.x = knot.rotation.x * 0.98;

  // parallax offset (smoothed)
  const parallaxStrength = 0.45;
  const targetY = -mouseY * parallaxStrength;
  const targetX = mouseX * parallaxStrength * 0.8;

  // lerp toward target for smoothness
  knot.rotation.x += (targetY - knot.rotation.x) * 0.04;
  knot.rotation.y += (targetX - knot.rotation.y) * 0.04;

  // slow, slight scale breathing
  const breath = 1.0 + Math.sin(t * 0.6) * 0.01;
  knot.scale.setScalar(PARAMS.scale * breath);
  duplicate.scale.setScalar(PARAMS.scale * 0.985 * breath);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Start the loop
animate();

