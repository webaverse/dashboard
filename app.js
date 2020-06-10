import THREE from 'https://xrpackage.org/xrpackage/three.module.js';
import {XRPackageEngine, XRPackage} from 'https://xrpackage.org/xrpackage.js';
// import THREE from 'http://127.0.0.1:3000/xrpackage/three.module.js';
// import {XRPackageEngine, XRPackage} from 'http://127.0.0.1:3000/xrpackage.js';
import {GLTFLoader} from 'https://xrpackage.org/xrpackage/GLTFLoader.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

const _findObject = (o, name) => {
  let result = null;
  o.traverse(o => {
    if (!result && o.name === name) {
      result = o;
    }
  });
  return result;
};

(async () => {
  console.log('start engine 1');
  const pe = new XRPackageEngine({
    orbitControls: true,
  });
  console.log('start engine 1');
  document.body.appendChild(pe.domElement);
  pe.domElement.style.backgroundColor = '#000';
  
  pe.camera.position.set(0, 3, 5);
  pe.camera.updateMatrixWorld();
  pe.setCamera(pe.camera);

  pe.orbitControls.target.set(0, 3, 0);

  {  
    const renderer = new THREE.WebGLRenderer({
      canvas: pe.domElement,
      context: pe.getContext('webgl'),
      // antialias: true,
      // alpha: true,
      // preserveDrawingBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.autoClear = false;
    renderer.sortObjects = false;
    renderer.physicallyCorrectLights = true;
    renderer.xr.enabled = true;
    renderer.xr.setSession(pe.getProxySession());

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 1);

    const {scene: logoMesh} = await new Promise((accept, reject) => {
      new GLTFLoader().load('assets/logo.glb', accept, xhr => {}, reject);
    });
    const wMesh = _findObject(logoMesh, 'Webaverse');
    wMesh.position.set(0, 3 + 1.5, -2);
    // wMesh.rotation.order = 'YXZ';
    wMesh.scale.multiplyScalar(1.5, 1.5, 1.5);
    wMesh.originalPosition = wMesh.position.clone();
    wMesh.originalQuaternion = wMesh.quaternion.clone();
    scene.add(wMesh);
    const webaverseMesh = _findObject(logoMesh, 'W');
    webaverseMesh.position
      .sub(new THREE.Box3().setFromObject(webaverseMesh).getCenter(new THREE.Vector3()))
      .add(new THREE.Vector3(0, 3, -2));
    // webaverseMesh.rotation.order = 'YXZ';
    webaverseMesh.originalPosition = webaverseMesh.position.clone();
    webaverseMesh.originalQuaternion = webaverseMesh.quaternion.clone();
    scene.add(webaverseMesh);

    function animate(timestamp, frame) {
      wMesh.position.copy(wMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.8, 0));
      wMesh.quaternion.copy(wMesh.originalQuaternion)
        .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin((Date.now() % 1500) / 1500 * Math.PI * 2) * 0.15));
      webaverseMesh.position.copy(webaverseMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.5, 0));

      renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);
  }

  /* { https://github.com/avaer/doggo
    const res = await fetch('./doggo/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    pe.add(p);
  }
  { https://github.com/avaer/terrain
    const res = await fetch('./terrain/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    pe.add(p);
  }
  { https://github.com/avaer/tree
    const res = await fetch('./tree/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, -30, -31), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    pe.add(p);
  } */
  { // https://github.com/avaer/multitree
    console.log('load multitree');
    const res = await fetch('./augs/multitree/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/grass
    console.log('load grass');
    const res = await fetch('./augs/grass/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, -30, -31), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/chest
    console.log('load chest');
    const res = await fetch('./augs/chest/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/sprite
    console.log('load sprite');
    const res = await fetch('./augs/sprite/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/miku
    console.log('load miku');
    const res = await fetch('./augs/miku/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/skybox
    console.log('load skybox');
    const res = await fetch('./augs/skybox/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/ocean
    console.log('load ocean');
    const res = await fetch('./augs/ocean/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  { // https://github.com/avaer/cloud
    console.log('load cloud');
    const res = await fetch('./augs/cloud/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }

  let currentSession = null;
  function onSessionStarted(session) {
    session.addEventListener('end', onSessionEnded);
    
    currentSession = session;

    pe.setSession(session);
  }
  function onSessionEnded() {
    currentSession.removeEventListener('end', onSessionEnded);

    currentSession = null;

    pe.setSession(null);
  }
  document.getElementById('enter-xr-button').addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentSession === null) {
      navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: [
          'local-floor',
          'bounded-floor',
        ],
      }).then(onSessionStarted);
    } else {
      currentSession.end();
    }
  });

})();
