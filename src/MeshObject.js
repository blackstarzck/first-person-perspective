import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
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
          console.log(`${this.name} loaded`);
          this.mesh.traverse((child) => {
            if(child.isMesh){
              child.castShadow = true; // 복잡한 모델은 shadow를 받지 못할 수도 있음
            };
          });
          this.mesh.position.set(this.x, this.y, this.z);
          this.mesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);

          this.scene.add(this.mesh);
          this.setCannonBody();
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

      this.scene.add(this.mesh);
      this.setCannonBody();
    };
  }

  setCannonBody(){
    this.cannonBody = new Body({
      mass: this.mass,
      position: new Vec3(this.x, this.y, this.z),
      shape: new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2)),
      material: this.cannonMaterial,
    });

    this.cannonWorld.addBody(this.cannonBody);
  }
}