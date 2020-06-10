import THREE from 'https://static.xrpackage.org/xrpackage/three.module.js';
import {XRPackageEngine, XRPackage} from 'https://static.xrpackage.org/xrpackage.js';
import {GLTFLoader} from 'https:///static.xrpackage.org/xrpackage/GLTFLoader.js';

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

  function epsilon( value ) {

		return Math.abs( value ) < 1e-10 ? 0 : value;

	}
  function getCameraCSSMatrix( matrix ) {

		var elements = matrix.elements;

		return 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( - elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( elements[ 6 ] ) + ',' +
			epsilon( elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( - elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( - elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	}
  function getObjectCSSMatrix( matrix, cameraCSSMatrix ) {

		var elements = matrix.elements;
		var matrix3d = 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( - elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( - elements[ 6 ] ) + ',' +
			epsilon( - elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

		/* if ( isIE ) {

			return 'translate(-50%,-50%)' +
				'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)' +
				cameraCSSMatrix +
				matrix3d;

		} */

		return matrix3d;

	}
  function animate(timestamp, frame) {
    wMesh.position.copy(wMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.8, 0));
    wMesh.quaternion.copy(wMesh.originalQuaternion)
      .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin((Date.now() % 1500) / 1500 * Math.PI * 2) * 0.15));
    webaverseMesh.position.copy(webaverseMesh.originalPosition).add(new THREE.Vector3(0, Math.sin((Date.now() % 3000) / 3000 * Math.PI * 2) * 0.5, 0));

    const xrCamera = renderer.xr.getCamera(camera);
    const c = xrCamera.cameras[0];
    /* console.log('got camera', xrCamera.cameras[0]);
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(); */
    // iframe.style.transform = `matrix3d(${new THREE.Matrix4().getInverse(xrCamera.cameras[0].projectionMatrix).premultiply(xrCamera.cameras[0].matrix).toArray().join(',')})`;
    var fov = c.projectionMatrix.elements[ 5 ] * window.innerHeight / 2;
    var cameraCSSMatrix = c.isOrthographicCamera ?
			'scale(' + fov + ')' + 'translate(' + epsilon( tx ) + 'px,' + epsilon( ty ) + 'px)' + getCameraCSSMatrix( c.matrixWorldInverse ) :
			'translateZ(' + fov + 'px)' + getCameraCSSMatrix( c.matrixWorldInverse );
    iframeWrap.style.perspective = fov + 'px';
    iframeContainer.style.transform = cameraCSSMatrix;
    iframe.style.transform = getObjectCSSMatrix( iframe.object3d.matrixWorld, cameraCSSMatrix );
    /* iframe.style.transform = `matrix3d()`;
    iframe.object3d.onBeforeRender = function() {
      console.log('before render', Array.from(arguments));
    }; */

    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  const iframeWrap = document.createElement('div');
  iframeWrap.style.position = 'absolute';
  iframeWrap.style.top = 0;
  iframeWrap.style.left = 0;
  iframeWrap.style.width = '100vw';
  iframeWrap.style.height = '100vh';
  iframeWrap.style.transformStyle = 'preserve-3d';
  iframeWrap.style.pointerEvents = 'none';

  const iframeContainer = document.createElement('div');
  iframeContainer.style.position = 'absolute';
  iframeContainer.style.top = 0;
  iframeContainer.style.left = 0;
  iframeContainer.style.width = '100vw';
  iframeContainer.style.height = '100vh';
  iframeContainer.style.transformStyle = 'preserve-3d';
  iframeContainer.style.pointerEvents = 'none';

  const iframe = document.createElement('iframe');
  iframe.src = 'http://lol.com/';
  iframe.style.position = 'absolute';
  iframe.style.top = 0;
  iframe.style.left = 0;
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  // iframe.style.transformStyle = 'preserve-3d';
  // iframe.style.transform = `matrix3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1)`;
  iframe.object3d = new THREE.Object3D();
  iframe.object3d.scale.set(1/window.innerWidth, 1/window.innerWidth, 1);
  scene.add(iframe.object3d);

  iframeWrap.appendChild(iframeContainer);
  iframeContainer.appendChild(iframe);
  document.body.appendChild(iframeWrap);

  /* {
    const res = await fetch('./doggo/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    pe.add(p);
  }
  {
    const res = await fetch('./terrain/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    pe.add(p);
  }
  {
    const res = await fetch('./tree/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, -30, -31), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    pe.add(p);
  } */
  {
    console.log('load multitree');
    const res = await fetch('./augs/multitree/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
    console.log('load grass');
    const res = await fetch('./augs/grass/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, -30, -31), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
    console.log('load chest');
    const res = await fetch('./augs/chest/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
    console.log('load sprite');
    const res = await fetch('./augs/sprite/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
    console.log('load miku');
    const res = await fetch('./augs/miku/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
    console.log('load skybox');
    const res = await fetch('./augs/skybox/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
    console.log('load ocean');
    const res = await fetch('./augs/ocean/a.wbn');
    const ab = await res.arrayBuffer();
    const uint8Array = new Uint8Array(ab);
    const p = new XRPackage(uint8Array);
    p.setMatrix(localMatrix.compose(localVector.set(0, 0, 0), localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1)));
    await pe.add(p);
  }
  {
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
