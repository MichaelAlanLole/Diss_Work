// IMPORTS
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createScene } from './sceneCreation';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { round } from 'three/tsl';

// Import Scene Creation
const { scene, camera, renderer } = createScene();

const loader = new GLTFLoader();

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

controls.enableRotate = false;

controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;

const popUpClose = document.getElementById('close-pop-up');
popUpClose.addEventListener('click', () => {
	document.getElementById('pop-up').style.display = 'none';
	controls.enableRotate = true;
})

function createContinentMarkers(name, x, y, z) {
	// Make sure the model is loaded before cloning!
	if (!continentModel) return null;
	const marker = continentModel.clone();
	marker.position.set(x, y, z);
	marker.name = name; // e.g. "continentMarker1"
	return marker;
}

const ball = new THREE.Mesh(new THREE.SphereGeometry(24, 50, 50), new THREE.MeshBasicMaterial());
scene.add(ball);

const markerGroup = new THREE.Group();

let continentModel;
loader.load(
	'./models/Pin.glb', // Path to the .gltf file
	(gltf) => {
		continentModel = gltf.scene;

		// Create markers for the continents at desired positions
		const marker1 = createContinentMarkers("continentMarker1", -19, 22, 5);
		const marker2 = createContinentMarkers("continentMarker2", 0, 22, 20);
		const marker3 = createContinentMarkers("continentMarker3", -27, 5, 10);
		const marker4 = createContinentMarkers("continentMarker4", 3, 21, -22);
		const marker5 = createContinentMarkers("continentMarker5", -14, -5, -26);
		const marker6 = createContinentMarkers("continentMarker6", 19, -14, 23);

		// Add markers to the group (making sure each marker exists)
		if (marker1) markerGroup.add(marker1);
		if (marker2) markerGroup.add(marker2);
		if (marker3) markerGroup.add(marker3);
		if (marker4) markerGroup.add(marker4);
		if (marker5) markerGroup.add(marker5);
		if (marker6) markerGroup.add(marker6);

		// Add the marker group to the scene
		ball.add(markerGroup);
	},
	(xhr) => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
	},
	(error) => {
		console.error('An error occurred while loading the model:', error);
	}
)

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
	const popUpDisplay = window.getComputedStyle(document.getElementById('pop-up')).display;

	if (popUpDisplay === 'none') {
		mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
		mousePos.y = - (e.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mousePos, camera);
		const intersects = raycaster.intersectObjects([ball, markerGroup], true);
		if (intersects.length > 0) {
			const firstHit = intersects[0].object;
			let obj = firstHit;

			while (obj) {
				if (obj.name && obj.name.startsWith("continentMarker")) {
					break;
				}
				obj = obj.parent;
			}
			if (obj && obj.name && obj.name.startsWith("continentMarker")) {
				hoveredObject = obj;
				labelP.className = "tooltip show";

				const pos = new THREE.Vector3();
				hoveredObject.getWorldPosition(pos);

				cPointLabel.position.copy(pos).add(new THREE.Vector3(0, 10, 0));

				// Set tooltip text based on the hovered object's name
				switch (hoveredObject.name) {
					case "continentMarker1":
						labelP.textContent = "Click to reveal Europe";
						break;
					case "continentMarker2":
						labelP.textContent = "Click to reveal Asia";
						break;
					case "continentMarker3":
						labelP.textContent = "Click to reveal Africa";
						break;
					case "continentMarker4":
						labelP.textContent = "Click to reveal North America";
						break;
					case "continentMarker5":
						labelP.textContent = "Click to reveal South America";
						break;
					case "continentMarker6":
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
	const intersects = raycaster.intersectObjects([ball, markerGroup], true);
	if (intersects.length > 0) {
		let obj = intersects[0].object;

		while (obj) {
			if (obj.name && obj.name.startsWith("continentMarker")) {
				break;
			}
			obj = obj.parent;
		}
		if (obj && obj.name && obj.name.startsWith("continentMarker")) {

			hideAllContainers();

			switch (obj.name) {
				case "continentMarker1":
					Europe_Container.style.display = "inline";
					break;
				case "continentMarker2":
					Asia_Container.style.display = "inline";
					break;
				case "continentMarker3":
					Africa_Container.style.display = "inline";
					break;
				case "continentMarker4":
					NorthAmerica_Container.style.display = "inline";
					break;
				case "continentMarker5":
					SouthAmerica_Container.style.display = "inline";
					break;
				case "continentMarker6":
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
ball.add(markerGroup);

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
				let value = parseInt(aqiString, 10);
				if (isNaN(value)) value = 0;

				let aqiStatus = 'Unknown';
				let aqiColor = '#999';
				if (value <= 20) {
					aqiStatus = 'Good';
					aqiColor = 'green';
				} else if (value <= 40) {
					aqiStatus = 'Fair';
					aqiColor = 'yellow';
				} else if (value <= 60) {
					aqiStatus = 'Moderate';
					aqiColor = 'orange';
				} else if (value <= 80) {
					aqiStatus = 'Poor';
					aqiColor = 'red';
				} else if (value <= 100) {
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

				const aqiRounded = parseFloat(aqiString).toFixed(2);

				const aqiValueLine = document.createElement('div');
				aqiValueLine.classList.add('dropdown-eaqi'); // You can add styling rules for this class in your CSS
				aqiValueLine.textContent = `AQI: ${aqiRounded}`;
				qualityDiv.appendChild(aqiValueLine);

				// Create a colored square box that visually represents the AQI
				const colorBox = document.createElement('span');
				colorBox.classList.add('air-quality-box');
				colorBox.style.backgroundColor = aqiColor;
				qualityDiv.appendChild(colorBox);

				const detailsDiv = document.createElement('div');
				detailsDiv.classList.add('dropdown-details');
				locationDiv.appendChild(detailsDiv);


				const params = [
					{ label: 'PM10', tag: 'PM10' },
					{ label: 'PM2.5', tag: 'PM2_5' },
					{ label: 'Carbon Monoxide', tag: 'CarbonMonoxide' },
					{ label: 'Nitrogen Dioxide', tag: 'NitrogenDioxide' }
				];

				function pm10Value(value) {
					if (value <= 20) {
						return 'green'
					} else if (value <= 40) {
						return 'yellow'
					} else if (value <= 50) {
						return 'orange'
					} else if (value <= 100) {
						return 'red'
					} else if (value <= 150) {
						return 'purple'
					} else {
						return 'maroon'
					}
				}

				function pm25Value(value) {
					if (value <= 10) {
						return 'green'
					} else if (value <= 20) {
						return 'yellow'
					} else if (value <= 25) {
						return 'orange'
					} else if (value <= 50) {
						return 'red'
					} else if (value <= 75) {
						return 'purple'
					} else {
						return 'maroon'
					}
				}

				function NitrogenValue(value) {
					if (value <= 40) {
						return 'green'
					} else if (value <= 90) {
						return 'yellow'
					} else if (value <= 120) {
						return 'orange'
					} else if (value <= 230) {
						return 'red'
					} else if (value <= 340) {
						return 'purple'
					} else {
						return 'maroon'
					}
				}

				params.forEach(param => {
					const paramDiv = document.createElement('div');
					paramDiv.classList.add('paramDiv');
					const header = document.createElement('h3');
					header.textContent = `${param.label}:`;
					const p = document.createElement('p');
					let valueText = 'N/A';

					let paramColorBox = document.createElement('span');
					paramColorBox.classList.add('air-quality-box');

					if (observation) {
						const rawValue = getValue(param.tag);
						const roundValue = parseFloat(rawValue);

						if (!isNaN(roundValue)) {
							valueText = roundValue.toFixed(2);

							let paramColor

							if (param.label === 'PM10') {
								paramColor = pm10Value(roundValue);
								paramColorBox.style.backgroundColor = paramColor;
							} else if (param.label === 'PM2.5') {
								paramColor = pm25Value(roundValue);
								paramColorBox.style.backgroundColor = paramColor;
							} else if (param.label === 'Nitrogen Dioxide') {
								paramColor = NitrogenValue(roundValue);
								paramColorBox.style.backgroundColor = paramColor;
							} else {
								paramColorBox.style.display = 'none';
							}
						} else {
							valueText = 'N/A';
						}
					}
					p.textContent = valueText;

					const lilDiv = document.createElement('div');
					lilDiv.classList.add('lilDiv');

					paramDiv.appendChild(header);

					lilDiv.appendChild(p);
					lilDiv.appendChild(paramColorBox);

					paramDiv.appendChild(lilDiv);
					detailsDiv.appendChild(paramDiv);
				});

				header.addEventListener('click', () => {
					// Toggle the "show" class on the details
					detailsDiv.classList.toggle('show');
					header.classList.toggle('border');
				});

				containerId.appendChild(locationDiv);
			}
		});
	})
	.catch(error => {
		console.error('Error fetching or processing files:', error);
	});

	document.querySelectorAll('.aqi-scale-header').forEach(header => {
		header.addEventListener('click', function () {
		  // Toggle the "open" class on the parent container of this header
		  header.parentElement.classList.toggle('open');
		});
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