import THREE from 'https://static.xrpackage.org/xrpackage/three.module.js';
import { XRPackageEngine, XRPackage } from 'https://static.xrpackage.org/xrpackage.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

(async () => {
  console.log('start engine 1');
  const pe = new XRPackageEngine({
    orbitControls: true,
  });

  console.log('start engine 2');
  document.body.appendChild(pe.domElement);
  pe.domElement.style.backgroundColor = '#000';

  pe.camera.position.set(0, 3, 5);
  pe.camera.updateMatrixWorld();
  pe.setCamera(pe.camera);

  pe.orbitControls.target.set(0, 3, 0);

  {
    console.log('load logo');
    fetch('./augs/webaverse-logo/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/multitree
    console.log('load multitree');
    fetch('./augs/multitree/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/grass
    console.log('load grass');
    fetch('./augs/grass/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, -30, -31), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/chest
    console.log('load chest');
    fetch('./augs/chest/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/sprite
    console.log('load sprite');
    fetch('./augs/sprite/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/miku
    console.log('load miku');
    fetch('./augs/miku/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/skybox
    console.log('load skybox');
    fetch('./augs/skybox/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    })
  }
  { // https://github.com/avaer/ocean
    console.log('load ocean');
    fetch('./augs/ocean/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
  }
  { // https://github.com/avaer/cloud
    console.log('load cloud');
    fetch('./augs/cloud/a.wbn').then(res => {
      res.arrayBuffer().then(ab => {
        const uint8Array = new Uint8Array(ab);
        const p = new XRPackage(uint8Array);
        p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
        pe.add(p);
      });
    });
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
