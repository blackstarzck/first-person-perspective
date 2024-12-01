import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
} from 'three';

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
    this.loader = info.loader;
    this.modelSrc = info.modelSrc;
    this.scene = info.scene;
    
    if(info.modelSrc){
      // GLB
      this.loader.load(
        this.modelSrc,
        (glb) => {
          console.log('loaded');
          glb.scene.traverse((child) => {
            if(child.isMesh){
              child.castShadow = true;
            }
            console.log("child: ", child);
          });
          glb.scene.castShadow = true; // 복잡한 모델은 shadow를 받지 못할 수도 있음
          glb.scene.position.set(this.x, this.y, this.z);

          this.scene.add(glb.scene);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
          console.error('An error happened', error);
        }
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
  
      this.scene.add(this.mesh);
    };
  }
}