// IMPORTS
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import Background from 'three/src/renderers/common/Background.js';

// SCENE CREATION
const scene = new THREE.Scene();
scene.background = 0xffffff;


// CAMERA CREATION
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Light Creation

// Ambient light gives whole scene a constant amount of light
const amb_light = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(amb_light);

const dir_light = new THREE.DirectionalLight(0xFFFFFF, 1);
dir_light.castShadow = true;
dir_light.position.set(1, 1, 2);
scene.add(dir_light);

const helper = new THREE.DirectionalLightHelper(dir_light, 5);
scene.add(helper);

// RENDERER CREATION
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// CSS2D Renderer Creation, Sets Window Size, Sets Position, Sets pointerEvents To
// None Which Allows The Use Of Orbit Controls, Then Appends The Renderer To The HTML Document
const label_renderer = new CSS2DRenderer();
label_renderer.setSize(window.innerWidth, window.innerHeight);
label_renderer.domElement.style.position = "absolute";
label_renderer.domElement.style.top = "0px";
label_renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(label_renderer.domElement);

// Shadow Map Set Up
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Set Animate Function To Loop, Append The Script To The Body Of The HTML File
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// HANDLE RESIZING OF WINDOW
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	label_renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create Spheres For The Labels
function createCpointMesh(name, x, y, z) {
	const geo = new THREE.SphereGeometry(0.1);
	const mat = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
	const mesh = new THREE.Mesh(geo, mat);
	mesh.position.set(x, y, z);
	mesh.name = name;
	return mesh;
}

// Create Group To Hold Spheres
const sphereGroup = new THREE.Group();

// Create Spheres, Give Them A Name And A X, Y, Z And Add To The Group
const sphereMesh1 = createCpointMesh("sphereMesh1", -0.5, 0, 1.5);
sphereGroup.add(sphereMesh1);

const sphereMesh2 = createCpointMesh("sphereMesh2", -0.3, 0, 1.5);
sphereGroup.add(sphereMesh2);

const sphereMesh3 = createCpointMesh("sphereMesh3", -0.1, 0, 1.5);
sphereGroup.add(sphereMesh3);

const sphereMesh4 = createCpointMesh("sphereMesh4", 0.1, 0, 1.5);
sphereGroup.add(sphereMesh4);

const sphereMesh5 = createCpointMesh("sphereMesh5", 0.3, 0, 1.5);
sphereGroup.add(sphereMesh5);

const sphereMesh6 = createCpointMesh("sphereMesh6", 0.5, 0, 1.5);
sphereGroup.add(sphereMesh6);

// Adds Group To Scene
scene.add(sphereGroup);

// Label Creation

// Creation Of Label Text
const labelP = document.createElement("p");
labelP.className = "tooltip";
const pContainer = document.createElement("div");
pContainer.appendChild(labelP);
const cPointLabel = new CSS2DObject(pContainer);
scene.add(cPointLabel);

// Creation Of Raycaster
const mousePos = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Event Listener For The Raycaster
window.addEventListener("mousemove", function (e) {
	mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
	mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mousePos, camera);
	const intersects = raycaster.intersectObjects([ball, sphereGroup], true);
	if (intersects.length > 0) {
		const firstHit = intersects[0].object;
		if (firstHit.name.startsWith("sphereMesh")) {
			switch (intersects[0].object.name) {
				case "sphereMesh1":
					labelP.className = "tooltip show";
					cPointLabel.position.set(-0.5, 0.8, 1.5);
					labelP.textContent = "Click to reveal Europe";
					break;
				case "sphereMesh2":
					labelP.className = "tooltip show";
					cPointLabel.position.set(-0.3, 0.8, 1.5);
					labelP.textContent = "Click to reveal Asia";
					break;
				case "sphereMesh3":
					labelP.className = "tooltip show";
					cPointLabel.position.set(-0.1, 0.8, 1.5);
					labelP.textContent = "Click to reveal Africa";
					break;
				case "sphereMesh4":
					labelP.className = "tooltip show";
					cPointLabel.position.set(0.1, 0.8, 1.5);
					labelP.textContent = "Click to reveal North America";
					break;
				case "sphereMesh5":
					labelP.className = "tooltip show";
					cPointLabel.position.set(0.3, 0.8, 1.5);
					labelP.textContent = "Click to reveal South America";
					break;
				case "sphereMesh6":
					labelP.className = "tooltip show";
					cPointLabel.position.set(0.5, 0.8, 1.5);
					labelP.textContent = "Click to reveal Somewhere else";
					break;
				default:
					break;
			}
		} else {
			labelP.className = "tooltip hide";
		}
	} else {
		labelP.className = "tooltip hide";
	}
});

// GEOMETRY CREATION
const ball_geo = new THREE.SphereGeometry(1, 20, 20);
const ball_mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(ball_geo, ball_mat);
ball.receiveShadow = true;
scene.add(ball);

// ANIMATE FUNCTION
function animate() {

	// RENDERES THE SCENE EACH FRAME
	renderer.render(scene, camera);

	// Renders The Labels Each Frame
	label_renderer.render(scene, camera);

	// Update Orbit Controls
	controls.update();
}

// DETECTS IF WINDOW HAS BEEN RESIZED, IF IT HAS, IT ADJUSTS ACCORDINGLY
window.addEventListener("resize", onWindowResize());

// CALLS FUNCTION
animate();