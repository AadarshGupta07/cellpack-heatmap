import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

/**
 * Base
 */
// GLTF loader
const gltfLoader = new GLTFLoader()

// Debug
const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);

const fpsGraph = pane.addBlade({
  view: 'fpsgraph',
  label: 'fpsgraph',
})

const params = { 
  color: '#ffffff',
  wireframe: false
};

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 10))
})


/***
 *  Lights
 */
// Ambient Light
const light1  = new THREE.AmbientLight('#fefefe', 0.5);

const light2  = new THREE.DirectionalLight('#ffffff', 2);
light2.position.set(0, 10, 0); 
scene.add(light1, light2)


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.dampingFactor = 0.04
// controls.minDistance = 5
// controls.maxDistance = 60
// controls.enableRotate = true
// controls.enableZoom = true
// controls.maxPolarAngle = Math.PI /2.5


/**
 *  using canvas Texture
 */
let canvas2 = document.createElement('canvas');

canvas2.width = 512;
canvas2.height = 512;

let ctx = canvas2.getContext('2d');

let redRadius = 0
let gradientSize = 256

let gradient = ctx.createRadialGradient(256, 256, redRadius, 256, 256, gradientSize);

let obj = { x: 0.5, y: 0 }
gradient.addColorStop(0, '#FF0000');
gradient.addColorStop(obj.x, '#FFFF00');
gradient.addColorStop(0.8, '#0000FF');
gradient.addColorStop(1, '#000000');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas2.width, canvas2.height);

let texture = new THREE.CanvasTexture(canvas2);

let cellMaterial = new THREE.MeshBasicMaterial({ map: texture, wireframe: params.wireframe });

/**
 *  Model
 */
gltfLoader.load(
  'modelm.glb',
  (gltf) => {
    const cellGroup = new THREE.Group();

    gltf.scene.traverse((child)=> {
      if(child.isMesh){
        child.material = cellMaterial;
        cellGroup.add(child.clone());
      }
    });

    const m = cellGroup.clone()
    m.position.y = 0.85;

    scene.add(m);

    const cellsGroup = new THREE.Group();

    function createBatteryPack() {
      cellsGroup.clear();

      const xDim = parseInt(document.getElementById("x-dim").value);
      const yDim = parseInt(document.getElementById("y-dim").value);
      const zDim = parseInt(document.getElementById("z-dim").value);
      const cellSpacing = 0.8;

      for (let x = 1; x <= xDim; x++) {
        for (let y = 1; y <= yDim; y++) {
          for (let z = 1; z <= zDim; z++) {
            const cell = cellGroup.clone();
            cell.position.set(x * cellSpacing - 0.8, y * 1.8, z * cellSpacing - 0.8);
            if(z % 2 == 0 && z > 1){
              cell.rotation.x = Math.PI;
            }
            cellsGroup.add(cell);
          }
        }
      }

      scene.add(cellsGroup);
      cellsGroup.position.y = - 0.95;
    }

    let btn = document.getElementById('btn');
    btn.addEventListener('click', createBatteryPack);
  }
);

window.onload = function () {
  var inputs = document.getElementsByClassName("input");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "1";
  }
};

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x18142c, 1);
renderer.outputEncoding = THREE.sRGBEncoding


/**
 *  Gui 
 */

// add a folder for the scene background color
const folder = pane.addFolder({ title: 'Background Color' });

folder.addInput(params, 'color').on('change', () => {
  const color = new THREE.Color(params.color);
  scene.background = color;
});


folder.addInput(params, 'wireframe').on('change', (value) => {
   cellMaterial.wireframe = params.wireframe
})


/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
  fpsGraph.begin()

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  // if(model){

  //     // group.rotation.y = elapsedTime 
  // }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  fpsGraph.end()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()