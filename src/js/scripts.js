import * as THREE from "three";
import * as YUKA from "yuka";
import GSAP from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background
renderer.setClearColor(0x94d8f8);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Camera positioning
camera.position.set(3, 10, 218);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0xe1e1e1, 0.3);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x94d8f8, 0x9cff2e, 0.3);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
scene.add(directionalLight);

renderer.outputEncoding = THREE.sRGBEncoding;

const loader = new GLTFLoader();
const dLoader = new DRACOLoader();
dLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
);
dLoader.setDecoderConfig({ type: "js" });
loader.setDRACOLoader(dLoader);

loader.load("./assets/terrain.glb", function (glb) {
  const model = glb.scene;
  scene.add(model);
});

const sync = (entity, renderComponent) => {
  renderComponent.matrix.copy(entity.worldMatrix);
};

const createCarV = (model, path, entityManager, yRotation) => {
  const group = new THREE.Group();
  scene.add(group);
  group.matrixAutoUpdate = false;

  const car = SkeletonUtils.clone(model);
  group.add(car);

  const v = new YUKA.Vehicle();
  v.setRenderComponent(group, sync);

  entityManager.add(v);

  const followPathBehavior = new YUKA.FollowPathBehavior(path, 2);
  const onPathBehavior = new YUKA.OnPathBehavior(path);
  onPathBehavior.radius = 0.1;

  v.position.copy(path.current());
  v.maxSpeed = 5;
  v.steering.add(onPathBehavior);
  v.steering.add(followPathBehavior);

  followPathBehavior.active = false;

  v.rotation.fromEuler(0, yRotation, 0);

  const vehicleAll = { vehicle: v, modelGroup: car };
  return vehicleAll;
};

// // Sets a 12 by 12 gird helper
// const gridHelper = new THREE.GridHelper(12, 12);
// scene.add(gridHelper);

// // Sets the x, y, and z axes with each having a length of 4
// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

function animate() {
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
