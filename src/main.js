// IMPORTS: Load Three.js core and extensions
import * as THREE from 'three';
// OrbitControls for user interaction
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// Custom scene creation helper
import { createScene } from './sceneCreation';
// CSS2DRenderer & CSS2DObject for HTML-based labels in 3D space
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
// Loader for GLTF 3D models
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Utility (unused here) imported - do not comment out
import { round } from 'three/tsl';

// Initialize scene, camera, and WebGL renderer from helper
const { scene, camera, renderer } = createScene();

// Loader instance for GLTF models
const loader = new GLTFLoader();

// Skybox setup: cube texture loader with six images
const CtextureLoader = new THREE.CubeTextureLoader();
const skyboxTexture = CtextureLoader.load([
	'Assets/skybox/right.png',
	'Assets/skybox/left.png',
	'Assets/skybox/top.png',
	'Assets/skybox/bottom.png',
	'Assets/skybox/front.png',
	'Assets/skybox/back.png',
]);
scene.background = skyboxTexture; // Apply skybox to scene background

// Directional lights to illuminate the scene
const dir_light = new THREE.DirectionalLight(0xFFFFFF, 1);
dir_light.castShadow = true; // Enable shadows
// Position light and its target
dir_light.position.set(-20, 0, 300);
dir_light.target.position.set(0, 0, 250);
scene.add(dir_light, dir_light.target);

const dir_light2 = new THREE.DirectionalLight(0xFFFFFF, 1);
dir_light2.castShadow = true;
dir_light2.position.set(30, 10, -20);
dir_light2.target.position.set(30, -5, -35);
scene.add(dir_light2, dir_light2.target);

// CSS2DRenderer for rendering HTML labels on top of the canvas
const label_renderer = new CSS2DRenderer();
label_renderer.setSize(window.innerWidth, window.innerHeight);
label_renderer.domElement.style.position = "absolute";
label_renderer.domElement.style.top = "0px";
// Disable pointer events so canvas controls still work
label_renderer.domElement.style.pointerEvents = "none";
document.body.appendChild(label_renderer.domElement);

// OrbitControls to allow camera rotation (disabled by default here)
const controls = new OrbitControls(camera, renderer.domElement);
// Initial camera placement
camera.position.z = 280;
camera.lookAt(0, 0, 200);
controls.target.set(0, 0, 200);
controls.update();

// Disable user rotation until pop-up is closed
controls.enableRotate = false;
controls.enableDamping = true; // Smooth motion
controls.enablePan = false;
controls.enableZoom = false;

// Pop-up close button enables rotation again
const popUpClose = document.getElementById('close-pop-up');
popUpClose.addEventListener('click', () => {
	document.getElementById('pop-up').style.display = 'none';
	controls.enableRotate = true;
});

// Helper to clone and position continent markers once model is loaded
function createContinentMarkers(name, x, y, z) {
	if (!continentModel) return null; // Check if model is ready
	const marker = continentModel.clone();
	marker.position.set(x, y, z);
	marker.name = name; // Identifier for interaction
	return marker;
}

// Base sphere representing the planet
const ball = new THREE.Mesh(
	new THREE.SphereGeometry(24, 50, 50),
	new THREE.MeshBasicMaterial()
);
scene.add(ball);

// Group to hold all continent markers
const markerGroup = new THREE.Group();
let continentModel; // Will store loaded pin model

// Load 3D pin model and place markers for each continent
loader.load(
	'Assets/models/Pin.glb',
	(gltf) => {
		continentModel = gltf.scene;
		// Create markers with names and positions
		const marker1 = createContinentMarkers("continentMarker1", -19, 22, 5);
		const marker2 = createContinentMarkers("continentMarker2", 0, 22, 20);
		const marker3 = createContinentMarkers("continentMarker3", -27, 5, 10);
		const marker4 = createContinentMarkers("continentMarker4", 3, 21, -22);
		const marker5 = createContinentMarkers("continentMarker5", -14, -5, -26);
		const marker6 = createContinentMarkers("continentMarker6", 19, -14, 23);

		// Add existing markers to the group
		[marker1, marker2, marker3, marker4, marker5, marker6].forEach(marker => {
			if (marker) markerGroup.add(marker);
		});

		// Attach markers to the planet
		ball.add(markerGroup);
	},
	(xhr) => {
		console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`); // Progress logging
	},
	(error) => {
		console.error('An error occurred while loading the model:', error);
	}
);

// LABEL SETUP: HTML element and CSS2DObject for tooltips
const labelP = document.createElement("p");
labelP.className = "tooltip";
const pContainer = document.createElement("div");
pContainer.appendChild(labelP);
const cPointLabel = new CSS2DObject(pContainer);
scene.add(cPointLabel);

// Raycaster and mouse vector for interaction detection
const mousePos = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let hoveredObject = null; // Track current marker under cursor

// Handle mouse movement to display continent tooltips
window.addEventListener("mousemove", function (e) {
	// Only if pop-up is hidden
	if (window.getComputedStyle(document.getElementById('pop-up')).display === 'none') {
		// Normalize mouse coords
		mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
		mousePos.y = - (e.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mousePos, camera);
		const intersects = raycaster.intersectObjects([ball, markerGroup], true);

		if (intersects.length > 0) {
			// Find topmost continent marker in hierarchy
			let obj = intersects[0].object;
			while (obj && !obj.name.startsWith("continentMarker")) {
				obj = obj.parent;
			}

			if (obj && obj.name.startsWith("continentMarker")) {
				hoveredObject = obj;
				labelP.className = "tooltip show";

				// Position label above marker
				const pos = new THREE.Vector3();
				hoveredObject.getWorldPosition(pos);
				cPointLabel.position.copy(pos).add(new THREE.Vector3(0, 10, 0));

				// Set tooltip text based on marker name
				switch (hoveredObject.name) {
					case "continentMarker1": labelP.textContent = "Click to reveal Europe"; break;
					case "continentMarker2": labelP.textContent = "Click to reveal Asia"; break;
					case "continentMarker3": labelP.textContent = "Click to reveal Africa"; break;
					case "continentMarker4": labelP.textContent = "Click to reveal North America"; break;
					case "continentMarker5": labelP.textContent = "Click to reveal South America"; break;
					case "continentMarker6": labelP.textContent = "Click to reveal Oceania"; break;
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

// Utility to hide all continent overlays
function hideAllContainers() {
	Europe_Container.style.display = "none";
	Africa_Container.style.display = "none";
	Asia_Container.style.display = "none";
	SouthAmerica_Container.style.display = "none";
	NorthAmerica_Container.style.display = "none";
	Oceania_Container.style.display = "none";
}

// Close buttons for overlays call hideAllContainers
const closeButton = document.querySelectorAll(".close-overlay");
closeButton.forEach(button => {
	button.addEventListener('click', hideAllContainers);
});

// Listen for any click on the window
window.addEventListener('click', function (e) {
    // Normalize mouse X to -1..1 based on viewport width
    mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    // Normalize mouse Y to -1..1 based on viewport height (invert Y)
    mousePos.y = - (e.clientY / this.window.innerHeight) * 2 + 1;

    // Shoot a ray from the camera through the mouse position
    raycaster.setFromCamera(mousePos, camera);
    // Check intersections against the earth “ball” and any continent markers
    const intersects = raycaster.intersectObjects([ball, markerGroup], true);

    if (intersects.length > 0) {
        // Grab the first intersected object
        let obj = intersects[0].object;

        // Traverse up parent chain to find a marker whose name starts with "continentMarker"
        while (obj) {
            if (obj.name && obj.name.startsWith("continentMarker")) {
                break;
            }
            obj = obj.parent;
        }

        // If we found a continent marker...
        if (obj && obj.name && obj.name.startsWith("continentMarker")) {
            // Hide all continent data panels
            hideAllContainers();

            // Show only the panel corresponding to the clicked marker
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
                    // No action if marker name is unexpected
                    break;
            }
        }
    }
});


// Declare variables for the 3D models and their load states
let earthModel;
let cloud;
let fastcloud;
let earthLoad = false;
let cloudSlowLoad = false;
let fastCloudLoad = false;

// Load the low-poly Earth model
loader.load(
    'Assets/models/low_poly_earthv2-3.glb', // path to model file
    (gltf) => {
        earthModel = gltf.scene;         // extract scene graph
        scene.add(earthModel);           // add to Three.js scene
        earthModel.castShadow = true;    // enable shadows
        earthModel.receiveShadow = true; // receive shadows
        earthModel.position.set(0, -25, 200); // position the Earth
        console.log('Model loaded:', gltf);
        earthLoad = true;                // mark as loaded
    },
    (xhr) => {
        // Progress callback: log percentage loaded
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
        // Error callback
        console.error('An error occurred while loading the model:', error);
    }
);

// Load the slower-moving cloud layer
loader.load(
    'Assets/models/cloud.glb',
    (gltf) => {
        cloud = gltf.scene;
        cloud.castShadow = true;
        cloud.receiveShadow = true;
        cloud.position.set(0, -25, 0); // align with Earth
        ball.add(cloud);               // add as child of the Earth “ball”
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

// Load the fast-moving cloud layer
loader.load(
    'Assets/models/fastclouds.glb',
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

// Position the main “ball” (Earth) and attach the marker group
ball.position.set(0, -1, 200);
ball.add(markerGroup);

// List of XML files for air quality data per continent
const xmlFiles = [
    'Assets/Data/Europe_air_quality_data.xml',
    'Assets/Data/Asia_air_quality_data.xml',
    'Assets/Data/Africa_air_quality_data.xml',
    'Assets/Data/NorthAmerica_air_quality_data.xml',
    'Assets/Data/SouthAmerica_air_quality_data.xml',
    'Assets/Data/Oceania_air_quality_data.xml'
];

// Fetch all XML files in parallel, handle errors gracefully
const fetchPromises = xmlFiles.map(file =>
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
            }
            return response.text(); // return XML as text
        })
        .catch(error => {
            console.error("Error fetching file:", file, error);
            return ''; // return empty string on error to keep Promise.all going
        })
);

// Grab references to each continent’s HTML container
const Europe_Container = document.getElementById('Europe-container');
const Africa_Container = document.getElementById('Africa-container');
const Asia_Container = document.getElementById('Asia-container');
const SouthAmerica_Container = document.getElementById('SouthAmerica-container');
const NorthAmerica_Container = document.getElementById('NorthAmerica-container');
const Oceania_Container = document.getElementById('Oceania-container');

// Fetch all XML files concurrently
Promise.all(fetchPromises)
    .then(fileContents => {
        // Iterate over each fetched XML string and its original file index
        fileContents.forEach((xmlString, fileIndex) => {
            // Warn and skip if a file returned no content
            if (!xmlString) {
                console.warn(`No content for file ${xmlFiles[fileIndex]}`);
                return;
            }

            const fileName = xmlFiles[fileIndex];
            let containerId = null;

            // Determine which container corresponds to this file based on its name
            if (fileName === 'Assets/Data/Europe_air_quality_data.xml') { containerId = Europe_Container; }
            else if (fileName === 'Assets/Data/Africa_air_quality_data.xml') { containerId = Africa_Container; }
            else if (fileName === 'Assets/Data/Asia_air_quality_data.xml') { containerId = Asia_Container; }
            else if (fileName === 'Assets/Data/NorthAmerica_air_quality_data.xml') { containerId = NorthAmerica_Container; }
            else if (fileName === 'Assets/Data/SouthAmerica_air_quality_data.xml') { containerId = SouthAmerica_Container; }
            else if (fileName === 'Assets/Data/Oceania_air_quality_data.xml') { containerId = Oceania_Container; }
            else {
                // No known container for this file
                console.warn(`No matching container for file: ${fileName}`);
                return;
            }

            // Parse the XML string into a DOM document
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

            // Check for parsing errors in the XML
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                console.error(`Parsing error in ${xmlFiles[fileIndex]}:`, parserError.textContent);
                return; // Skip processing this file
            }

            // Get all <Location> elements in the XML
            const locations = xmlDoc.getElementsByTagName('Location');
            console.log(`File "${xmlFiles[fileIndex]}" has ${locations.length} locations`);

            // Process each location element
            for (let i = 0; i < locations.length; i++) {
                const locationElement = locations[i];

                // Create a container div for this location's data
                const locationDiv = document.createElement('div');
                locationDiv.classList.add('locationDiv');

                // Extract city and country values, or use defaults
                const cityNode = locationElement.getElementsByTagName('City')[0];
                const countryNode = locationElement.getElementsByTagName('Country')[0];
                const city = cityNode ? cityNode.textContent : 'Unknown City';
                const country = countryNode ? countryNode.textContent : 'Unknown Country';

                // Get the current observation data
                const observation = locationElement.getElementsByTagName('CurrentObservation')[0];

                // Helper to safely retrieve a tag's text content
                const getValue = (tag) => {
                    const elem = observation.getElementsByTagName(tag)[0];
                    return elem ? elem.textContent : 'N/A';
                };

                // Parse the EuropeanAQI value and default to 0 if invalid
                const aqiString = getValue('EuropeanAQI');
                let value = parseInt(aqiString, 10);
                if (isNaN(value)) value = 0;

                // Determine AQI status label and color based on thresholds
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

                // Create header section for the dropdown
                const header = document.createElement('div');
                header.classList.add('dropdown-header');
                locationDiv.appendChild(header);

                // Title span showing "City, Country"
                const titleSpan = document.createElement('span');
                titleSpan.textContent = `${city}, ${country}`;
                titleSpan.classList.add('titleSpan');
                header.appendChild(titleSpan);

                // Container for AQI value and color box
                const qualityDiv = document.createElement('div');
                qualityDiv.classList.add('qualityDiv');
                header.appendChild(qualityDiv);

                // Round the AQI value to two decimals for display
                const aqiRounded = parseFloat(aqiString).toFixed(2);
                const aqiValueLine = document.createElement('div');
                aqiValueLine.classList.add('dropdown-eaqi');
                aqiValueLine.textContent = `AQI: ${aqiRounded}`;
                qualityDiv.appendChild(aqiValueLine);

                // Colored square to visually represent the AQI level
                const colorBox = document.createElement('span');
                colorBox.classList.add('air-quality-box');
                colorBox.style.backgroundColor = aqiColor;
                qualityDiv.appendChild(colorBox);

                // Details section (hidden by default) for pollutant breakdown
                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('dropdown-details');
                locationDiv.appendChild(detailsDiv);

                // List of pollutants to display
                const params = [
                    { label: 'PM10', tag: 'PM10' },
                    { label: 'PM2.5', tag: 'PM2_5' },
                    { label: 'Carbon Monoxide', tag: 'CarbonMonoxide' },
                    { label: 'Nitrogen Dioxide', tag: 'NitrogenDioxide' }
                ];

                // Helper functions to choose a color based on pollutant concentration
                function pm10Value(value) {
                    if (value <= 20) return 'green';
                    if (value <= 40) return 'yellow';
                    if (value <= 50) return 'orange';
                    if (value <= 100) return 'red';
                    if (value <= 150) return 'purple';
                    return 'maroon';
                }

                function pm25Value(value) {
                    if (value <= 10) return 'green';
                    if (value <= 20) return 'yellow';
                    if (value <= 25) return 'orange';
                    if (value <= 50) return 'red';
                    if (value <= 75) return 'purple';
                    return 'maroon';
                }

                function NitrogenValue(value) {
                    if (value <= 40) return 'green';
                    if (value <= 90) return 'yellow';
                    if (value <= 120) return 'orange';
                    if (value <= 230) return 'red';
                    if (value <= 340) return 'purple';
                    return 'maroon';
                }

                // Create a section for each pollutant
                params.forEach(param => {
                    const paramDiv = document.createElement('div');
                    paramDiv.classList.add('paramDiv');

                    const header = document.createElement('h3');
                    header.textContent = `${param.label}:`;

                    const p = document.createElement('p');
                    let valueText = 'N/A';

                    // Box to show pollutant concentration color
                    let paramColorBox = document.createElement('span');
                    paramColorBox.classList.add('air-quality-box');

                    if (observation) {
                        const rawValue = getValue(param.tag);
                        const roundValue = parseFloat(rawValue);

                        if (!isNaN(roundValue)) {
                            valueText = roundValue.toFixed(2);
                            let paramColor;

                            // Assign color based on pollutant type
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
                                // Hide box for unsupported pollutants
                                paramColorBox.style.display = 'none';
                            }
                        }
                    }

                    p.textContent = valueText;
                    const lilDiv = document.createElement('div');
                    lilDiv.classList.add('lilDiv');
                    lilDiv.appendChild(p);
                    lilDiv.appendChild(paramColorBox);

                    paramDiv.appendChild(header);
                    paramDiv.appendChild(lilDiv);
                    detailsDiv.appendChild(paramDiv);
                });

                // Add click handler to header to toggle details visibility
                header.addEventListener('click', () => {
                    detailsDiv.classList.toggle('show');
                    header.classList.toggle('border');
                });

                // Append this location's div into the appropriate continent container
                containerId.appendChild(locationDiv);
            }
        });
    })
    .catch(error => {
        // Log any errors during fetch or processing
        console.error('Error fetching or processing files:', error);
    });

// Set up accordion behavior for AQI scale sections
document.querySelectorAll('.aqi-scale-header').forEach(header => {
    header.addEventListener('click', function () {
        header.parentElement.classList.toggle('open');
    });
});

// Animation loop for 3D scene rendering
function animate() {
    requestAnimationFrame(animate);

    // Render main scene and labels each frame
    renderer.render(scene, camera);
    label_renderer.render(scene, camera);

    // Rotate cloud layers once loaded
    if (fastCloudLoad && earthLoad && cloudSlowLoad === true) {
        cloud.rotation.y += 0.0002;
        fastcloud.rotation.y += 0.0005;
    }
}

// Kick off the animation loop
animate();
