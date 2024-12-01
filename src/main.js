import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshObject } from './MeshObject';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2: 1);
renderer.shadowMap.enabled = true;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Camera
const camera = new THREE.PerspectiveCamera(
	60, // fov
	window.innerWidth / window.innerHeight, // aspect
	0.1, // near
	1000 // far
);
camera.position.set(0, 3, 7);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
const loader = new GLTFLoader();
loader.load(
	'/models/desk.glb',
	(glb) => {
		console.log('loaded');
		glb.scene.position.y = 0.4;
		scene.add(glb.scene);
	},
	(xhr) => {
		console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	},
	(error) => {
		console.error('An error happened', error);
	}
);

// Light
const ambientLight = new THREE.AmbientLight('white', 1);
const pointLight = new THREE.PointLight('white', 100, 100);
pointLight.castShadow = true;
pointLight.position.set(0, 10, 0);

scene.add(ambientLight, pointLight);

// Mesh
const ground = new MeshObject({
	name: 'ground',
	color: '#092E66',
	width: 50,
	height: 0.1,
	depth: 50,
	scene
});
const floorMesh = new MeshObject({
	name: 'floor',
	width: 5,
	height: 0.4,
	depth: 5,
	castShadow: true,
	scene
});

const wall1 = new MeshObject({
	name: 'wall1',
	width: 5,
	height: 3,
	depth: 0.2,
	z: -2.4,
	scene
});
const wall2 = new MeshObject({
	name: 'wall2',
	width: 0.2,
	height: 3,
	depth: 4.8,
	x: 2.4,
	z: 0.1,
	scene
});

// Draw
const clock = new THREE.Clock();
function draw() {
  
	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}

draw();

function setLayout() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Events
window.addEventListener('resize', setLayout);