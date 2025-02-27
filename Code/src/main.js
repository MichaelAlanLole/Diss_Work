// Imports
import * as THREE from "three"; // Import THREE.js
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

console.log("Running")

// Scene creation
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

// Lights
const ambLight = new THREE.AmbientLight(0xffffff);
scene.add(ambLight);

// Rederer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Geometry
const earthGeom = new THREE.SphereGeometry(0.6, 32, 32);
const earthMaterial = new THREE.MeshPhongMaterial();
const earthMesh = new THREE.Mesh(earthGeom, earthMaterial);
  
scene.add(earthMesh);

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();
