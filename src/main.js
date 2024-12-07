import * as THREE from 'three';
import { MeshObject, Lamp, RoboticVaccum } from './MeshObject';
import { KeyController } from './KeyController';
import { TouchController } from './TouchController';
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
const touchController = new TouchController();

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
	modelSrc: './models/desk.glb',
	width: 1.8,
	height: 0.8,
	depth: 0.75,
	x: 1.2,
	z: -1.9,
});

const lamp = new Lamp({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 10,
	cannonShape: new CANNON.Cylinder(0.25, 0.3, 1.8, 32),
	geometry: new THREE.CylinderGeometry(0.25, 0.25, 1.81, 32),
	scene,
	loader: gltfLoader,
	name: 'lamp',
	modelSrc: './models/lamp.glb',
	width: 0.5,
	height: 1.8,
	depth: 0.5,
	z: -1.7,
	callback: () => {
		// 조명 추가
		// light 를 mesh 의 하위 요소로 추가
		const lampLight = new THREE.PointLight('#EAC6AB', 0, 50);
		lampLight.castShadow = true;
		lampLight.shadow.mapSize.width = 2048;
		lampLight.shadow.mapSize.height = 2048;

		lampLight.position.set(0, .75, 0);

		lamp.mesh.add(lampLight); // lampLight 가 lamp 의 하위요소가 되어 lamp 의 위치를 따라감 (그룹화)
		lamp.light = lampLight;
	}
});

const roboticVaccum = new RoboticVaccum({
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 10,
	cannonShape: new CANNON.Cylinder(0.25, 0.25, 0.1, 32),
	geometry: new THREE.CylinderGeometry(0.25, 0.25, 0.11, 32),
	scene,
	loader: gltfLoader,
	name: 'roboticVaccum',
	modelSrc: './models/vaccum.glb',
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
	mapSrc: './models/magazine.jpg',
	width: 0.2,
	height: 0.02,
	depth: 0.29,
	x: 0.7,
	y: 1.32,
	z: -2.2,
	rotationX: THREE.MathUtils.degToRad(52)
});

cannonObjects.push(ground, floorMesh, wall1, wall2, desk, lamp, roboticVaccum, magazine);



// Device detection
let device;
const setDevice = () => {
	const htmlElement = document.querySelector('html');
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	device = isMobile ? 'mobile' : 'desktop';

	htmlElement.classList.add(isMobile ? 'touchevents' : 'no-touchevents');
}

// Raycaaster
const mouse = new THREE.Vector2(); // 마우스 좌표를 저장할 객체
const raycaster = new THREE.Raycaster(); // 광선을 쏠 레이캐스터 객체
const checkIntersect = () => {
	raycaster.setFromCamera(mouse, camera); // 마우스 좌표를 기준으로 광선을 쏨

	const intersects = raycaster.intersectObjects(scene.children);
	for(const item of intersects){

		console.log(item.object.name);

		if(item.object.name === 'ground'){
			break;
		}else if(item.object.name === 'floor'){
			break;
		}else if(item.object.name === 'wall1'){
			break;
		}else if(item.object.name === 'wall2'){
			break;
		}else if(item.object.name === 'desk'){
			break;
		}else if(item.object.name === 'lamp'){
			lamp.togglePower();
			break;
		}else if(item.object.name === 'roboticVaccum'){
			roboticVaccum.togglePower();
			break;
		}else if(item.object.name === 'magazine'){
			break;
		};
	};
}


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

			if(object.transparentMesh){
				object.transparentMesh.position.copy(object.cannonBody.position);
				object.transparentMesh.quaternion.copy(object.cannonBody.quaternion);
			};
		};
	};

	if(player.cannonBody){
		player.x = player.cannonBody.position.x;
		player.y = player.cannonBody.position.y;
		player.z = player.cannonBody.position.z;
		player.mesh.position.copy(player.cannonBody.position);
		

		if(device === 'mobile'){
			moveMobile();
		}else{
			move();
		};
	};

  moveCamera();
	roboticVaccum.move();

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

const moveMobile = () => {
	if(!touchController.walkTouch) return;

	const cx = touchController.cx;
	const cy = touchController.cy;
	const xx = touchController.walkTouch.clientX - cx;
	const yy = touchController.walkTouch.clientY - cy;
	const angle = Math.atan2(-yy, xx);
	const angle2 = Math.atan2(yy, xx);

	player.walkMobile(delta, angle); // delta 는 속도를 조절하기 위한 값, angle 은 이동 방향을 결정하는 값
	
	touchController.setAngleOfBar(angle2); // 45도
}

const setLayout = () => {
	setDevice();

	if(device === 'mobile') touchController.setPosition();

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
	let factor = device === 'mobile' ? delta * 0.3 : delta * 10; // 모바일 환경을 위한 감도조절, 곱하는 값이 클수록 민감해짐

	// rotation
	euler.setFromQuaternion(camera.quaternion);
	euler.y -= movementX * factor;
	euler.x -= movementY * factor;
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
	if(device === 'mobile') return; // 모바일에서는 'lock' 이벤트가 발생하지 않음
	canvas.requestPointerLock(); // 마우스 커서를 숨기고 클릭 시 컨트롤을 얻음 (게임 모드)
});

document.addEventListener('pointerlockchange', () => {
	if(document.pointerLockElement === canvas){
		setMode('game');
	}else{
		setMode('website');
	};
});

canvas.addEventListener('click', (event) => {
	if(device === 'mobile'){
		mouse.x = event.clientX / window.innerWidth * 2 - 1;
		mouse.y = -(event.clientX / window.innerWidth * 2 - 1);
		checkIntersect();
	}else{
		mouse.x = 0;
		mouse.y = 0;
		if(document.body.dataset.mode === 'game'){
			checkIntersect();
		};
	};
});

const touchX = [];
const touchY = [];
window.addEventListener('touchstart', (event) => {

	if(touchController.elem === event.target)	return;

	// 초기화
	movementX = 0; 
	movementY = 0; 

	touchX[0] = event.targetTouches[0].clientX;
	touchX[1] = event.targetTouches[0].clientX;
	touchY[0] = event.targetTouches[0].clientY;
	touchY[1] = event.targetTouches[0].clientY;
});

window.addEventListener('touchmove', (event) => {
	if(touchController.elem === event.target)	return;

	// 초기화
	movementX = 0; 
	movementY = 0; 

	// 이동량 계산
	touchX[0] = touchX[1]; // previous
	touchX[1] = event.targetTouches[0].clientX; // current
	touchY[0] = touchY[1];
	touchY[1] = event.targetTouches[0].clientY;

	movementX = touchX[1] - touchX[0];
	movementY = touchY[1] - touchY[0];

	console.log(movementX, movementY);
});

window.addEventListener('touchend', (event) => {
	if(touchController.elem === event.target)	return;

	// 초기화
	movementX = 0;
	movementY = 0;

	touchX[0] = touchX[1] = 0;
	touchY[0] = touchY[1] = 0;
});

// 이벤트의 기본 동작을 막음, 계산에 오차가 생기지 않도록
window.addEventListener('gesturestart', (event) => {
	event.preventDefault();
});
window.addEventListener('gesturechange', (event) => {
	event.preventDefault();
});
window.addEventListener('gestureend', (event) => {
	event.preventDefault();
});


setDevice();
setMode('website');
draw();
