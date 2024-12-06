import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  MeshBasicMaterial
} from 'three';
import {
  Vec3, // x, y, z
  Box,
  Body,
  Quaternion
 } from 'cannon-es';


export class MeshObject {
  constructor(info) {
    
    this.name = info.name;
    this.width = info.width || 1;
    this.height = info.height || 1;
    this.depth = info.depth || 1;
    this.color = info.color || '#FFFFFF';
    this.differenceY = info.differenceY ?? 0.4;
    this.x = info.x || 0;
    this.y = info.y || this.height / 2 + this.differenceY;
    this.z = info.z || 0;
    this.rotationX = info.rotationX || 0;
    this.rotationY = info.rotationY || 0;
    this.rotationZ = info.rotationZ || 0;
    this.loader = info.loader;
    this.modelSrc = info.modelSrc;
    this.mapSrc = info.mapSrc;
    this.scene = info.scene;

    this.cannonShape = info.cannonShape || new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2));

    // Cannon
    this.mass = info.mass || 0;
    this.cannonWorld = info.cannonWorld;
    this.cannonMaterial = info.cannonMaterial;
    
    if(info.modelSrc){
      // GLB
      this.loader.load(
        this.modelSrc,
        (glb) => {
          this.mesh =  glb.scene;
          this.mesh.traverse((child) => {
            if(child.isMesh){
              child.castShadow = true; // 복잡한 모델은 shadow를 받지 못할 수도 있음
            };
          });
          this.mesh.position.set(this.x, this.y, this.z);
          this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
          this.mesh.name = this.name;

          this.scene.add(this.mesh);

          // Transparent Mesh for Raycasting
          const geometry = info.geometry || new BoxGeometry(this.width, this.height, this.depth);
          this.transparentMesh = new Mesh(
            geometry,
            new MeshBasicMaterial({
              color: 'green',
              transparent: true,
              opacity: 0
            })
          );
          this.transparentMesh.name = this.name;
          this.transparentMesh.position.set(this.x, this.y, this.z);
          this.scene.add(this.transparentMesh);

          this.setCannonBody();

          if(info.callback) info.callback();
        },
        (xhr) => {
          // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('An error happened', error);
        }
      );
    }else if(this.mapSrc){
      // Textures
      const geometry = new BoxGeometry(this.width, this.height, this.depth);
      this.loader.load(
        this.mapSrc,
        (texture) => {
          const material = new MeshLambertMaterial({
            map: texture,
          });
          this.mesh = new Mesh(geometry, material);
          this.mesh.castShadow = true;
          this.mesh.receiveShadow = true;
          this.mesh.position.set(this.x, this.y, this.z);
          this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
          this.mesh.name = this.name;

          this.scene.add(this.mesh);
          this.setCannonBody();
        },
      );
    }else{
      // Primitives
      const geometry = new BoxGeometry(this.width, this.height, this.depth);
      const material = new MeshLambertMaterial({
        color: this.color,
      });
  
      this.mesh = new Mesh(geometry, material);
      this.mesh.castShadow = true
      this.mesh.receiveShadow = true
      this.mesh.position.set(this.x, this.y, this.z);
      this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
      this.mesh.name = this.name;

      this.scene.add(this.mesh);
      this.setCannonBody();
    };
  }

  setCannonBody(){
    this.cannonBody = new Body({
      mass: this.mass,
      position: new Vec3(this.x, this.y, this.z),
      shape: this.cannonShape,
      material: this.cannonMaterial,
    });

    // this.cannonBody.quaternion.setFromAxisAngle(
    //   new Vec3(0, 1, 0), // y축 기준으로
    //   this.rotationY
    // );

    // rotation: x
    const quatX = new Quaternion();
    const axisX = new Vec3(1, 0, 0);
    quatX.setFromAxisAngle(axisX, this.rotationX);

    // rotation: x
    const quatY = new Quaternion();
    const axisY = new Vec3(0, 1, 0);
    quatY.setFromAxisAngle(axisY, this.rotationY);

    // rotation: x
    const quatZ = new Quaternion();
    const axisZ = new Vec3(0, 0, 1);
    quatZ.setFromAxisAngle(axisZ, this.rotationZ);

    const combinedQuat = quatX.mult(quatY).mult(quatZ);
    this.cannonBody.quaternion = combinedQuat;

    this.cannonWorld.addBody(this.cannonBody);
  }
}

export class Lamp extends MeshObject {
  constructor(info){
    super(info);
  }

  togglePower(){
    console.log("togglePower intensity: ", this.light);

    this.light.intensity = this.light.intensity === 0 ? 3 : 0;
  }
}

export class RoboticVaccum extends MeshObject {
  constructor(info){
    super(info);
    this.powerOn = false;
    this.r = 0; // 반지름
    this.angle = 0;
    this.originX = this.x;
    this.originZ = this.z;
  }
  
  togglePower(){
    this.powerOn = !this.powerOn;
  }

  move(){
    if(this.powerOn){
      this.cannonBody.position.x = this.originX + Math.cos(this.angle) * this.r;
      this.cannonBody.position.z = this.originZ + Math.sin(this.angle) * this.r;
      this.angle += 0.003;
      this.r = Math.sin(this.angle * 2);
    };
  }
}