import { GLTFLoader } from 'https://xrpackage.org/xrpackage/GLTFLoader.js';

let camera, scene, renderer, container;
let wMesh, webaverseMesh;

const _findObject = (o, name) => {
  let result = null;
  o.traverse(o => {
    if (!result && o.name === name) {
      result = o;
    }
  });
  return result;
};

init();
requestSession();

window.addEventListener("unload", closeSession);

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  new GLTFLoader().load('./logo.glb', gltf => {
    wMesh = _findObject(gltf.scene, 'Webaverse');
    wMesh.position.set(0, 3 + 1.5, -2);
    wMesh.scale.multiplyScalar(1.5, 1.5, 1.5);
    wMesh.originalPosition = wMesh.position.clone();
    wMesh.originalQuaternion = wMesh.quaternion.clone();
    scene.add(wMesh);

    webaverseMesh = _findObject(gltf.scene, 'W');
    webaverseMesh.position
      .sub(new THREE.Box3().setFromObject(webaverseMesh).getCenter(new THREE.Vector3()))
      .add(new THREE.Vector3(0, 3, -2));
    webaverseMesh.originalPosition = webaverseMesh.position.clone();
    webaverseMesh.originalQuaternion = webaverseMesh.quaternion.clone();
    scene.add(webaverseMesh);
  }, _ => console.log('Webaverse logo loaded'),
    error => console.log('Error loading Webaverse logo', error),
  );

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.xr.enabled = true;
}

function requestSession() {
  navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
    let options = { optionalFeatures: ['local-floor', 'bounded-floor'] };
    navigator.xr.requestSession('immersive-vr', options).then(onSessionStarted);
  });
}

function onSessionStarted(session) {
  renderer.xr.setSession(session);
  renderer.setAnimationLoop(animate);
}

async function closeSession(session) {
  await renderer.xr.getSession().end();
}

function animate() {
  if (wMesh && webaverseMesh) {
    wMesh.position.copy(wMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.8, 0));
    wMesh.quaternion.copy(wMesh.originalQuaternion)
      .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin((Date.now() % 1500) / 1500 * Math.PI * 2) * 0.15));
    webaverseMesh.position.copy(webaverseMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.5, 0));
  }

  renderer.render(scene, camera);
}
