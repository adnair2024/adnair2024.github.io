import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";

const canvas = document.getElementById("bg");

// --- Configuration ---
const CONFIG = {
  lightTheme: {
    colorA: new THREE.Color(0xa5f3fc), // Cyan 200 - Visible water/glass tone
    colorB: new THREE.Color(0x38bdf8), // Sky 400 - Deeper blue accent
    background: new THREE.Color(0xf0f4f8)
  },
  darkTheme: {
    colorA: new THREE.Color(0x1f2937), // Gray 800 - Visible dark glass
    colorB: new THREE.Color(0x4b5563), // Gray 600 - Lighter highlights
    background: new THREE.Color(0x0b0f14)
  }
};

// --- State ---
const state = {
  mouseX: 0,
  mouseY: 0,
  scroll: 0,
  isDark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
};

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Scene & Camera ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;

// --- Object (Liquid Sphere) ---
const geometry = new THREE.IcosahedronGeometry(1.4, 64);

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: state.isDark ? CONFIG.darkTheme.colorA : CONFIG.lightTheme.colorA },
    uColorB: { value: state.isDark ? CONFIG.darkTheme.colorB : CONFIG.lightTheme.colorB },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vDistort;

    // Simplex noise function (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vNormal = normal;
      
      float noise = snoise(vec2(position.x * 0.5 + uTime * 0.3, position.y * 0.5 + uTime * 0.3));
      
      // Distortion affected by mouse and scroll
      float distort = noise * (0.3 + uScroll * 0.001);
      
      // Mouse interaction (push away)
      float mouseDist = distance(uMouse, position.xy);
      float mouseEffect = smoothstep(2.0, 0.0, mouseDist) * 0.5;
      
      vDistort = distort + mouseEffect;
      
      vec3 newPos = position + normal * vDistort;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    varying float vDistort;
    varying vec3 vNormal;

    void main() {
      float distort = vDistort * 2.0;
      
      // Mixing colors based on distortion and normal
      vec3 color = mix(uColorA, uColorB, distort + 0.5);
      
      // Add some iridescence/fresnel-like effect
      float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
      color = mix(color, vec3(1.0), (1.0 - fresnel) * 0.2);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  // wireframe: true 
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// --- Event Listeners ---

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// Mouse Move
window.addEventListener('mousemove', (e) => {
  // Normalize mouse position to -1 to 1
  state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  state.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Scroll
window.addEventListener('scroll', () => {
  state.scroll = window.scrollY;
});

// Theme Change
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
    state.isDark = e.matches;
    updateThemeUniforms();
  };
  mediaQuery.addEventListener('change', handleThemeChange);
}

function updateThemeUniforms() {
  const theme = state.isDark ? CONFIG.darkTheme : CONFIG.lightTheme;
  
  material.uniforms.uColorA.value.copy(theme.colorA);
  material.uniforms.uColorB.value.copy(theme.colorB);
  renderer.setClearColor(theme.background, 1);
}

// Initial call
updateThemeUniforms();
console.log("Three.js Background Initialized", state.isDark ? "Dark Mode" : "Light Mode");

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();
  
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uScroll.value = state.scroll;
  
  // Smoothly interpolate mouse uniform
  material.uniforms.uMouse.value.x += (state.mouseX - material.uniforms.uMouse.value.x) * 0.05;
  material.uniforms.uMouse.value.y += (state.mouseY - material.uniforms.uMouse.value.y) * 0.05;

  // Rotate sphere slowly
  sphere.rotation.y = elapsedTime * 0.05;
  sphere.rotation.z = elapsedTime * 0.02;

  // Parallax effect on sphere position based on mouse
  sphere.position.x = material.uniforms.uMouse.value.x * 0.2;
  sphere.position.y = material.uniforms.uMouse.value.y * 0.2 + 0.2; // slight offset up

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();