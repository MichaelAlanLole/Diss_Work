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

function hideAllContainers() {
	Europe_Container.style.display = "none";
	Africa_Container.style.display = "none";
	Asia_Container.style.display = "none";
	SouthAmerica_Container.style.display = "none";
	NorthAmerica_Container.style.display = "none";
	Oceania_Container.style.display = "none";
}

const closeButton = document.querySelectorAll(".close-overlay");

closeButton.forEach(button => {
	button.addEventListener('click', () => {
		hideAllContainers();
	})
})

window.addEventListener('click', function (e) {
	mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
	mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mousePos, camera);
	const intersects = raycaster.intersectObjects([ball, sphereGroup], true);
	if (intersects.length > 0) {
		const firstHit = intersects[0].object;
		if (firstHit.name.startsWith("sphereMesh")) {

			hideAllContainers();

			switch (firstHit.name) {
				case "sphereMesh1":
					Europe_Container.style.display = "inline";
					break;
				case "sphereMesh2":
					Africa_Container.style.display = "inline";
					break;
				case "sphereMesh3":
					Asia_Container.style.display = "inline";
					break;
				case "sphereMesh4":
					NorthAmerica_Container.style.display = "inline";
					break;
				case "sphereMesh5":
					SouthAmerica_Container.style.display = "inline";
					break;
				case "sphereMesh6":
					Oceania_Container.style.display = "inline";
					break;
				default:
					break;
			}
		}
	}
})


let earthModel;
let cloud;
let fastcloud;
let earthLoad = false;
let cloudSlowLoad = false;
let fastCloudLoad = false;

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
		earthLoad = true;
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
		cloudSlowLoad = true;
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
		fastCloudLoad = true;
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

const xmlFiles = [
	'./Data/Europe_air_quality_data.xml',
	'./Data/Asia_air_quality_data.xml',
	'./Data/Africa_air_quality_data.xml',
	'./Data/NorthAmerica_air_quality_data.xml',
	'./Data/SouthAmerica_air_quality_data.xml',
	'./Data/Oceania_air_quality_data.xml'
];

const fetchPromises = xmlFiles.map(file =>
	fetch(file)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
			}
			return response.text();
		})
		.catch(error => {
			console.error("Error fetching file:", file, error);
			return ''; // Return empty string to continue Promise.all gracefully
		})
);

const Europe_Container = document.getElementById('Europe-container');
const Africa_Container = document.getElementById('Africa-container');
const Asia_Container = document.getElementById('Asia-container');
const SouthAmerica_Container = document.getElementById('SouthAmerica-container');
const NorthAmerica_Container = document.getElementById('NorthAmerica-container');
const Oceania_Container = document.getElementById('Oceania-container');

Promise.all(fetchPromises)
	.then(fileContents => {
		fileContents.forEach((xmlString, fileIndex) => {
			if (!xmlString) {
				console.warn(`No content for file ${xmlFiles[fileIndex]}`);
				return;
			}

			const fileName = xmlFiles[fileIndex];

			let containerId = null;

			if (fileName === './Data/Europe_air_quality_data.xml') { containerId = Europe_Container; }
			else if (fileName === './Data/Africa_air_quality_data.xml') { containerId = Africa_Container; }
			else if (fileName === './Data/Asia_air_quality_data.xml') { containerId = Asia_Container; }
			else if (fileName === './Data/NorthAmerica_air_quality_data.xml') { containerId = NorthAmerica_Container; }
			else if (fileName === './Data/SouthAmerica_air_quality_data.xml') { containerId = SouthAmerica_Container; }
			else if (fileName === './Data/Oceania_air_quality_data.xml') { containerId = Oceania_Container; }
			else {
				console.warn(`No matching container for file: ${fileName}`);
				return;
			}

			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

			// Check for parsing errors
			const parserError = xmlDoc.querySelector('parsererror');
			if (parserError) {
				console.error(`Parsing error in ${xmlFiles[fileIndex]}:`, parserError.textContent);
				return; // Skip this file
			}

			const locations = xmlDoc.getElementsByTagName('Location');
			console.log(`File "${xmlFiles[fileIndex]}" has ${locations.length} locations`);

			for (let i = 0; i < locations.length; i++) {
				const locationElement = locations[i];

				const locationDiv = document.createElement('div');
				locationDiv.classList.add('locationDiv');

				const cityNode = locationElement.getElementsByTagName('City')[0];
				const countryNode = locationElement.getElementsByTagName('Country')[0];
				const city = cityNode ? cityNode.textContent : 'Unknown City';
				const country = countryNode ? countryNode.textContent : 'Unknown Country';

				const observation = locationElement.getElementsByTagName('CurrentObservation')[0];
				const getValue = (tag) => {
					const elem = observation.getElementsByTagName(tag)[0];
					return elem ? elem.textContent : 'N/A';
				};

				const aqiString = getValue('EuropeanAQI');
				let aqiValue = parseInt(aqiString, 10);
				if (isNaN(aqiValue)) aqiValue = 0;

				let aqiStatus = 'Unknown';
				let aqiColor = '#999';
				if (aqiValue <= 20) {
					aqiStatus = 'Good';
					aqiColor = 'green';
				} else if (aqiValue <= 40) {
					aqiStatus = 'Fair';
					aqiColor = 'yellow';
				} else if (aqiValue <= 60) {
					aqiStatus = 'Moderate';
					aqiColor = 'orange';
				} else if (aqiValue <= 80) {
					aqiStatus = 'Poor';
					aqiColor = 'red';
				} else if (aqiValue <= 100) {
					aqiStatus = 'Very Poor';
					aqiColor = 'purple';
				} else {
					aqiStatus = 'Hazardous';
					aqiColor = 'maroon';
				}

				const header = document.createElement('div');
				header.classList.add('dropdown-header');
				locationDiv.appendChild(header);

				const titleSpan = document.createElement('span');
				titleSpan.textContent = `${city}, ${country}`;
				titleSpan.classList.add('titleSpan');
				header.appendChild(titleSpan);

				const qualityDiv = document.createElement('div');
				qualityDiv.classList.add('qualityDiv');
				header.appendChild(qualityDiv);

				const qualityLabel = document.createElement('span');
				qualityLabel.classList.add('air-quality-label');
				qualityLabel.textContent = aqiStatus;
				qualityDiv.appendChild(qualityLabel);

				// Create a colored square box that visually represents the AQI
				const colorBox = document.createElement('span');
				colorBox.classList.add('air-quality-box');
				colorBox.style.backgroundColor = aqiColor;
				qualityDiv.appendChild(colorBox);

				const detailsDiv = document.createElement('div');
				detailsDiv.classList.add('dropdown-details');
				locationDiv.appendChild(detailsDiv);

				const params = [
					{ label: 'European AQI', tag: 'EuropeanAQI' },
					{ label: 'PM10', tag: 'PM10' },
					{ label: 'PM2.5', tag: 'PM2_5' },
					{ label: 'Carbon Monoxide', tag: 'CarbonMonoxide' },
					{ label: 'Nitrogen Dioxide', tag: 'NitrogenDioxide' }
				];

				params.forEach(param => {
					const header = document.createElement('h3');
					header.textContent = `${param.label}:`;
					const p = document.createElement('p');
					p.textContent = `${observation ? getValue(param.tag) : 'N/A'}`;
					detailsDiv.appendChild(header);
					detailsDiv.appendChild(p);
				});

				header.addEventListener('click', () => {
					// Toggle the "show" class on the details
					detailsDiv.classList.toggle('show');
				});

				containerId.appendChild(locationDiv);
			}
		});
	})
	.catch(error => {
		console.error('Error fetching or processing files:', error);
	});

// Animate Function
function animate() {

	requestAnimationFrame(animate);

	// RENDERES THE SCENE EACH FRAME
	renderer.render(scene, camera);

	// Renders The Labels Each Frame
	label_renderer.render(scene, camera);

	if (fastCloudLoad && earthLoad && cloudSlowLoad === true) {
		cloud.rotation.y += 0.0002;
		fastcloud.rotation.y += 0.0005;
	}

}

// CALLS FUNCTION
animate();