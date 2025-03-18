// IMPORTS
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createScene } from './sceneCreation';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Import Scene Creation
const { scene, camera, renderer } = createScene();

const CtextureLoader = new THREE.CubeTextureLoader()
const skyboxTexture = CtextureLoader.load([
	'./skybox/right.png',
	'./skybox/left.png',
	'./skybox/top.png',
	'./skybox/bottom.png',
	'./skybox/front.png',
	'./skybox/back.png',
])
scene.background = skyboxTexture;

// Light Creation
const dir_light = new THREE.DirectionalLight(0xFFFFFF, 1);
dir_light.castShadow = true
dir_light.target.position.set(0, 0, 250);
dir_light.position.set(-20, 0, 300);
scene.add(dir_light);
scene.add(dir_light.target);

const dir_light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
dir_light2.castShadow = true
dir_light2.target.position.set(30, -5, -35);
dir_light2.position.set(30, 10, -20);
scene.add(dir_light2);
scene.add(dir_light2.target);


// CSS2D Renderer Creation, Sets Window Size, Sets Position, Sets pointerEvents To
// None Which Allows The Use Of Orbit Controls, Then Appends The Renderer To The HTML Document
const label_renderer = new CSS2DRenderer();
label_renderer.setSize(window.innerWidth, window.innerHeight);
label_renderer.domElement.style.position = "absolute";
label_renderer.domElement.style.top = "0px";
label_renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(label_renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.z = 280;
camera.lookAt(0, 0, 200);
controls.target.set(0, 0, 200);
controls.update();

controls.enablePan = false;
controls.enableDamping = true;
controls.enableZoom = false;

// Create Spheres For The Labels
function createCpointMesh(name, x, y, z) {
	const geo = new THREE.SphereGeometry(1);
	const mat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
	const mesh = new THREE.Mesh(geo, mat);
	mesh.position.set(x, y, z);
	mesh.castShadow = true;
	mesh.name = name;
	return mesh;
}

// Create Group To Hold Spheres
const sphereGroup = new THREE.Group();

// Create Spheres, Give Them A Name And A X, Y, Z And Add To The Group
const sphereMesh1 = createCpointMesh("sphereMesh1", -19, 22, 5);
sphereGroup.add(sphereMesh1);

const sphereMesh2 = createCpointMesh("sphereMesh2", 0, 22, 20);
sphereGroup.add(sphereMesh2);

const sphereMesh3 = createCpointMesh("sphereMesh3", -27, 5, 10);
sphereGroup.add(sphereMesh3);

const sphereMesh4 = createCpointMesh("sphereMesh4", 3, 21, -22);
sphereGroup.add(sphereMesh4);

const sphereMesh5 = createCpointMesh("sphereMesh5", -14, -5, -26);
sphereGroup.add(sphereMesh5);

const sphereMesh6 = createCpointMesh("sphereMesh6", 17, -12, 21);
sphereGroup.add(sphereMesh6);

// Adds Group To Scene
scene.add(sphereGroup);

const ball = new THREE.Mesh(new THREE.SphereGeometry(24, 50, 50), new THREE.MeshBasicMaterial());
scene.add(ball);

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

// Store What Object Is Closest To The Camera
let hoveredObject = null;

// Event Listener For The Raycaster
window.addEventListener("mousemove", function (e) {
	mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
	mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mousePos, camera);
	const intersects = raycaster.intersectObjects([ball, sphereGroup], true);
	if (intersects.length > 0) {
		const firstHit = intersects[0].object;
		if (firstHit.name.startsWith("sphereMesh")) {
			hoveredObject = firstHit;
			labelP.className = "tooltip show";

			const pos = new THREE.Vector3();
			hoveredObject.getWorldPosition(pos);

			cPointLabel.position.copy(pos).add(new THREE.Vector3(0, 10, 0));

			// Set tooltip text based on the hovered object's name
			switch (hoveredObject.name) {
				case "sphereMesh1":
					labelP.textContent = "Click to reveal Europe";
					break;
				case "sphereMesh2":
					labelP.textContent = "Click to reveal Asia";
					break;
				case "sphereMesh3":
					labelP.textContent = "Click to reveal Africa";
					break;
				case "sphereMesh4":
					labelP.textContent = "Click to reveal North America";
					break;
				case "sphereMesh5":
					labelP.textContent = "Click to reveal South America";
					break;
				case "sphereMesh6":
					labelP.textContent = "Click to reveal Oceania";
					break;
				default:
					break;
			}
		} else {
			hoveredObject = null;
			labelP.className = "tooltip hide";
		}
	} else {
		hoveredObject = null;
		labelP.className = "tooltip hide";
	}
});

// Click On Spheres Event Listener, Moves Camera To The Set Location
window.addEventListener("click", () => {
	if (!hoveredObject) return;
  
  controls.saveState();

	switch (hoveredObject.name) {
		case "sphereMesh1":
			camera.position.set(30, 5, -25);
			camera.lookAt(30, -5, -28.5);
			controls.target.set(30, -5, -28.5);
			controls.update();
			console.log(camera.position)
			break;
		case "sphereMesh2":
			camera.position.set(-30, 0, -20);
			camera.lookAt(-30, -5, -40);
			controls.target.set(-30, -5, -40);
			controls.update();
			break;
		case "sphereMesh3":
			camera.position.set(60, 0, -20);
			camera.lookAt(60, -5, -40);
			controls.target.set(60, -5, -40);
			controls.update();
			break;
		case "sphereMesh4":
			camera.position.set(-60, 0, -20);
			camera.lookAt(-60, -5, -40);
			controls.target.set(-60, -5, -40);
			controls.update();
			break;
		case "sphereMesh5":
			camera.position.set(100, 0, -20);
			camera.lookAt(100, -5, -40);
			controls.target.set(100, -5, -40);
			controls.update();
			break;
		case "sphereMesh6":
			camera.position.set(-100, 0, -20);
			camera.lookAt(-100, -5, -40);
			controls.target.set(-100, -5, -40);
			controls.update();
			break;
		default:
			break;
	}
})

const backBut = document.createElement("button");
backBut.className = "button hide";
document.getElementById("backButton").append(backBut);

let earthModel;
let cloud;
let fastcloud;
let EUmodel;

// Load GLTF model
const loader = new GLTFLoader();
loader.load(
	'./models/low_poly_earthv2-3.glb', // Path to the .gltf file
	(gltf) => {
		earthModel = gltf.scene;
		scene.add(earthModel);
		earthModel.castShadow = true;
		earthModel.receiveShadow = true;
		earthModel.position.set(0, -25, 200);
		console.log('Model loaded:', gltf);
	},
	(xhr) => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
	},
	(error) => {
		console.error('An error occurred while loading the model:', error);
	}
);

loader.load(
	'./models/cloud.glb', // Path to the .gltf file
	(gltf) => {
		cloud = gltf.scene;
		cloud.castShadow = true;
		cloud.receiveShadow = true;
		cloud.position.set(0, -25, 0);
    ball.add(cloud);
    console.log('Model loaded:', gltf);
	},
	(xhr) => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
	},
	(error) => {
		console.error('An error occurred while loading the model:', error);
	}
);

loader.load(
	'./models/fastclouds.glb', // Path to the .gltf file
	(gltf) => {
		fastcloud = gltf.scene;
		fastcloud.castShadow = true;
		fastcloud.receiveShadow = true;
		fastcloud.position.set(0, -25, 0);
    ball.add(fastcloud);
    console.log('Model loaded:', gltf);
	},
	(xhr) => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
	},
	(error) => {
		console.error('An error occurred while loading the model:', error);
	}
);

ball.position.set(0, -1, 200);
ball.add(sphereGroup);


loader.load(
	'./models/EUscene.glb', // Path to the .gltf file
	(gltf) => {
		EUmodel = gltf.scene;
		scene.add(EUmodel);
		EUmodel.position.set(30, -5, -30);
		console.log('Model loaded:', gltf);
	},
	(xhr) => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
	},
	(error) => {
		console.error('An error occurred while loading the model:', error);
	}
);

const floorGeo = new THREE.BoxGeometry(20, 0.2, 10);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

const floor2 = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor2);
floor2.position.set(-30, -5, -40);

const floor3 = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor3);
floor3.position.set(60, -5, -40);

const floor4 = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor4);
floor4.position.set(-60, -5, -40);

const floor5 = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor5);
floor5.position.set(100, -5, -40);

const floor6 = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor6);
floor6.position.set(-100, -5, -40);

// If Button Is Clicked, Sets Camera To Start Position And Hides Button
backBut.addEventListener("click", () => {
	controls.reset();
	controls.update();
	backBut.className = "button hide";
})


// Event Listener Checks If camStart Is False, If It Is, It Wont Proceed
// Checks The Key Pressed And Rotates Based On The Key

// Animate Function
function animate() {

	requestAnimationFrame(animate);

	// RENDERES THE SCENE EACH FRAME
	renderer.render(scene, camera);

	// Renders The Labels Each Frame
	label_renderer.render(scene, camera);


	if (camera.position.z > -20) {
		controls.enableRotate = true;
	} else {
		controls.enableRotate = false;
		console.log("no more movement")
		backBut.className = "button show"
	}

  cloud.rotation.y += 0.0002;
  fastcloud.rotation.y += 0.0005;

}

// CALLS FUNCTION
animate();