import * as THREE from 'three';
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Light
const ambientLight = new THREE.AmbientLight('white', 1);
const pointLight = new THREE.PointLight('white', 100, 100);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.position.set(0, 10, 0);

scene.add(ambientLight, pointLight);

// Mesh
const ground = new MeshObject({
	name: 'ground',
	color: '#092E66',
	width: 50,
	height: 0.1,
	depth: 50,
	scene,
	differenceY: 0
});
const floorMesh = new MeshObject({
	name: 'floor',
	width: 5,
	height: 0.4,
	depth: 5,
	castShadow: true,
	scene,
	differenceY: 0
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

const desk = new MeshObject({
	scene,
	loader: gltfLoader,
	name: 'desk',
	modelSrc: '/models/desk.glb',
	width: 1.8,
	height: 0.8,
	depth: 0.75,
	x: 1.2,
	z: -1.9
});

const lamp = new MeshObject({
	scene,
	loader: gltfLoader,
	name: 'lamp',
	modelSrc: '/models/lamp.glb',
	width: 0.5,
	height: 1.8,
	depth: 0.5,
	z: -1.7
});

const roboticVaccum = new MeshObject({
	scene,
	loader: gltfLoader,
	name: 'roboticVaccum',
	modelSrc: '/models/vaccum.glb',
	width: 0.5,
	height: 0.1,
	depth: 0.5,
	x: -1
});

const magazine = new MeshObject({
	scene,
	loader: textureLoader,
	name: 'magazine',
	mapSrc: '/models/magazine.jpg',
	width: 0.2,
	height: 0.02,
	depth: 0.29,
	x: 0.7,
	y: 1.32,
	z: -2.2,
	rotationX: THREE.MathUtils.degToRad(52)
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

document.addEventListener('click', () => {
	canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
	document.body.dataset.mode = document.pointerLockElement === canvas ? 'game' : 'website';
});