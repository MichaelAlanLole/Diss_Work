import * as THREE from 'three';

export function createScene() {

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Ambient light gives whole scene a constant amount of light
    const amb_light = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(amb_light);

    // Camera Creation
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Create the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Append the renderer to the document body
    document.body.appendChild(renderer.domElement);

    // Update camera and renderer on window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}