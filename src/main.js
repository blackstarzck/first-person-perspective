import * as THREE from 'three';
import { MeshObject } from './MeshObject';
import { KeyController } from './KeyController';
import { Player } from './Player';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as CANNON from 'cannon-es';


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
const controls = new PointerLockControls(camera, document.body);
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const keyController = new KeyController();

// Light
const ambientLight = new THREE.AmbientLight('white', 1);
const pointLight = new THREE.PointLight('white', 100, 100);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.position.set(0, 10, 0);

scene.add(ambientLight, pointLight);

// Physics
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -9.82, 0);

const defaultCannonMaterial = new CANNON.Material('default');
const playerCannonMaterial = new CANNON.Material('player');
const playerContactMaterial = new CANNON.ContactMaterial(
	playerCannonMaterial,
	playerCannonMaterial,
	{
		friction: 100,
		restitution: 0
	}
);

const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultCannonMaterial,
	defaultCannonMaterial,
	{
		friction: 1,
		restitution: 0.2
	}
);

cannonWorld.addContactMaterial(playerContactMaterial);
cannonWorld.defaultContactMaterial = defaultContactMaterial;

const cannonObjects = []; // 물리엔진에 영향을 받는 모든 객체를 넣어 제어


// Mesh
const player = new Player({
	scene,
	cannonWorld,
	cannonMaterial: playerCannonMaterial,
	mass: 50
});

const ground = new MeshObject({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'ground',
	color: '#092E66',
	width: 50,
	height: 0.1,
	depth: 50,
	scene,
	y: -0.05,
	differenceY: 0
});

const floorMesh = new MeshObject({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'floor',
	width: 5,
	height: 0.4,
	depth: 5,
	castShadow: true,
	scene,
	differenceY: 0
});

const wall1 = new MeshObject({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'wall1',
	width: 5,
	height: 3,
	depth: 0.2,
	z: -2.4,
	scene
});

const wall2 = new MeshObject({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'wall2',
	width: 0.2,
	height: 3,
	depth: 4.8,
	x: 2.4,
	z: 0.1,
	scene
});

const desk = new MeshObject({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 20,
	scene,
	loader: gltfLoader,
	name: 'desk',
	modelSrc: '/models/desk.glb',
	width: 1.8,
	height: 0.8,
	depth: 0.75,
	x: 1.2,
	z: -1.9,
});

const lamp = new MeshObject({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 10,
	cannonShape: new CANNON.Cylinder(0.25, 0.3, 1.8, 32),
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
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 10,
	cannonShape: new CANNON.Cylinder(0.25, 0.25, 0.1, 32),
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
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 0.5,
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

cannonObjects.push(ground, floorMesh, wall1, wall2, desk, lamp, roboticVaccum, magazine);

// Draw
const clock = new THREE.Clock();
let delta;
const draw = () => {
	delta = clock.getDelta();

	let cannonStepTime = 1 / 60;

	if(delta < 0.01) cannonStepTime = 1 / 120;

	cannonWorld.step(cannonStepTime, delta, 3);

	for(const object of cannonObjects){
		if(object.cannonBody){
			object.mesh.position.copy(object.cannonBody.position);
			object.mesh.quaternion.copy(object.cannonBody.quaternion);
		};
	};

	if(player.cannonBody){
		player.x = player.cannonBody.position.x;
		player.y = player.cannonBody.position.y;
		player.z = player.cannonBody.position.z;
		player.mesh.position.copy(player.cannonBody.position);
		move();

		// console.log('player.cannonBody.position: ', player.cannonBody.position);
	}

  moveCamera();

	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}

const move = () => {
	if(keyController.keys['KeyW'] || keyController.keys['ArrowUp']){
		player.walk(-0.05, 'forward');
	};
	if(keyController.keys['KeyS'] || keyController.keys['ArrowUDown']){
		player.walk(0.05, 'backward');
	};
	if(keyController.keys['KeyA'] || keyController.keys['ArrowLeft']){
		player.walk(0.05, 'left');
	};
	if(keyController.keys['KeyD'] || keyController.keys['ArrowRight']){
		player.walk(0.05, 'right');
	};
}

const setLayout = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

let movementX = 0, movementY = 0;

const updateMovementValue = (event) => {
	movementX = event.movementX * delta;
	movementY = event.movementY * delta;
}

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const minPolarAngle = 0;
const maxPolarAngle = Math.PI; // 180
const moveCamera = () => {
	// rotation
	euler.setFromQuaternion(camera.quaternion);
	euler.y -= movementX;
	euler.x -= movementY;
	euler.x = Math.max(
		Math.PI / 2 - maxPolarAngle,
		Math.min(Math.PI / 2 - minPolarAngle, euler.x)
	);

	movementX -= movementX * 0.2;
	movementY -= movementY * 0.2;
	if(Math.abs(movementX) < 0.005) movementX = 0;
	if(Math.abs(movementY) < 0.005) movementY = 0;

	camera.quaternion.setFromEuler(euler);
	player.rotationY = euler.y;

	// position
	camera.position.x = player.x;
	camera.position.y = player.y + 1;
	camera.position.z = player.z;
}

const setMode = (mode) => {
	document.body.dataset.mode = mode;

	if(mode === 'game'){
		document.addEventListener('mousemove', updateMovementValue);
	}else if(mode === 'wesite'){
		document.removeEventListener('mousemove', updateMovementValue);
	};
}

// Events
window.addEventListener('resize', setLayout);

document.addEventListener('click', () => {
	canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
	if(document.pointerLockElement === canvas){
		setMode('game');
	}else{
		setMode('website');
	};
});


draw();