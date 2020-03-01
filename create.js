import {OrbitControls} from './OrbitControls.js';
import {TransformControls} from './TransformControls.js';
import {BufferGeometryUtils} from './BufferGeometryUtils.js';
import {OutlineEffect} from './OutlineEffect.js';
import {XRControllerModelFactory} from './XRControllerModelFactory.js';
import {Ammo as AmmoLib} from './ammo.wasm.js';
import './gif.js';
import {makePromise} from './util.js';
import {apiHost, presenceHost} from './config.js';
import contract from './contract.js';
import screenshot from './screenshot.js';
import {objectImage, objectMaterial, makeObjectMeshFromGeometry, loadObjectMeshes, saveObjectMeshes} from './object.js';
import {createAction, execute, pushAction, undo, redo, clearHistory} from './actions.js';
import {makeObjectState, bindObjectScript, tickObjectScript/*, bindObjectShader*/} from './runtime.js';
import {makeId, XRChannelConnection} from './multiplayer.js';
import {initLocalRig, updatePlayerCamera, bindPeerConnection} from './peerconnection.js';

const _load = () => {

contract.init();

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}
function downloadFile(file, filename) {
  const blobURL = URL.createObjectURL(file);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', filename);

  // Safari thinks _blank anchor are pop ups. We only want to set _blank
  // target if the browser does not support the HTML5 download attribute.
  // This allows you to download files in desktop safari if pop up blocking
  // is enabled.
  /* if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank');
  } */

  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sq(n) { return n*n; }

const PARCEL_SIZE = 10;
const size = PARCEL_SIZE + 1;
const uiSize = 2048;
const uiWorldSize = 0.2;

const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.sortObjects = false;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xEEEEEE);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.5, 0.5, 2);
renderer.render(scene, camera);

const ambientLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3);
directionalLight.position.set(0.5, 1, 0.5).multiplyScalar(100);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 3);
directionalLight2.position.set(-0.5, -0.1, 0.5).multiplyScalar(100);
scene.add(directionalLight2);

const container = new THREE.Object3D();
scene.add(container);

const orbitControls = new OrbitControls(camera, interfaceDocument.querySelector('.background'), interfaceDocument);
orbitControls.target.copy(camera.position).add(new THREE.Vector3(0, 0, -1.5));
orbitControls.screenSpacePanning = true;
// orbitControls.enabled = !!loginToken;
orbitControls.enableMiddleZoom = false;
orbitControls.update();

const pointerMesh = (() => {
  const targetGeometry = BufferGeometryUtils.mergeBufferGeometries([
    new THREE.BoxBufferGeometry(0.01, 0.2, 0.01)
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.1, 0)),
    new THREE.BoxBufferGeometry(0.01, 0.2, 0.01)
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.1)),
    new THREE.BoxBufferGeometry(0.01, 0.2, 0.01)
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.1, 0, 0)),
  ]);
  const sidesGeometry = BufferGeometryUtils.mergeBufferGeometries([
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, 0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, -0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, 0.5, 0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))))
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, -1, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, -0.5, 0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))))
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0))))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, -0.5, -0.5)),
    targetGeometry.clone()
      .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1, 1, 0).normalize(), new THREE.Vector3(1, -1, 0).normalize())))
      .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, -0.5, 0.5)),
  ]).applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
  const sidesColors = new Float32Array(sidesGeometry.attributes.position.array.length);
  // sidesColors.fill(0);
  sidesGeometry.setAttribute('color', new THREE.BufferAttribute(sidesColors, 3));
  // const numSidesPositions = sidesGeometry.attributes.position.array.length;
  const dotsGeometries = [];
  const dotGeometry = new THREE.BoxBufferGeometry(0.01, 0.01, 0.01);
  for (let x = 0; x <= PARCEL_SIZE; x++) {
    for (let y = 0; y <= PARCEL_SIZE; y++) {
      for (let z = 0; z <= PARCEL_SIZE; z++) {
        const newDotGeometry = dotGeometry.clone()
          .applyMatrix4(new THREE.Matrix4().makeTranslation(x*0.1, y*0.1, z*0.1));
        dotsGeometries.push(newDotGeometry);
      }
    }
  }
  const dotsGeometry = BufferGeometryUtils.mergeBufferGeometries(dotsGeometries);
  const dotsColors = new Float32Array(dotsGeometry.attributes.position.array.length);
  dotsColors.fill(0.7);
  dotsGeometry.setAttribute('color', new THREE.BufferAttribute(dotsColors, 3));
  let geometry;
  const targetVsh = `
    uniform vec3 targetPos;
    attribute vec3 color;
    // varying float vZ;
    // varying vec2 vUv;
    varying vec3 vColor;
    varying float highlightDistance;
    float scale = 0.1;
    void main() {
      vec4 p = modelMatrix * vec4(position, 1.);
      vec4 p2 = viewMatrix * p;
      // vZ = -p2.z;
      gl_Position = projectionMatrix * p2;
      vColor = color;
      vec3 tp = targetPos.xyz + 1.0;
      vec3 cp = p.xyz/scale;
      float dx = tp.x - cp.x;
      float dy = tp.y - cp.y;
      float dz = tp.z - cp.z;
      highlightDistance = pow(sqrt(dx*dx + dy*dy + dz*dz), 0.5);
    }
  `;
  const targetFsh = `
    // uniform float uTime;
    uniform vec3 uBrushColor;
    varying vec3 vColor;
    // varying float vZ;
    varying float highlightDistance;
    float dRange = 1.3;
    float dLimit = 0.1;
    void main() {
      if (vColor.r == 0.0 && vColor.g == 0.0 && vColor.b == 0.0) {
        gl_FragColor = vec4(vColor, 1.0);
      } else {
        // gl_FragColor = vec4(highlightDistance, 0, 0, 1.0);
        float d = max(dRange - highlightDistance, dLimit);
        if (d > dLimit) {
          gl_FragColor = vec4(uBrushColor, d);
        } else {
          gl_FragColor = vec4(vec3(vColor), d);
        }
      }
    }
  `;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      targetPos: {
        type: 'v3',
        value: new THREE.Vector3(),
      },
      uBrushColor: {
        type: 'v3',
        value: new THREE.Vector3(),
      },
      uTime: {
        type: 'f',
        value: 0,
      },
    },
    vertexShader: targetVsh,
    fragmentShader: targetFsh,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const size = [0, 0, 0, 0, 0, 0];
  mesh.getSize = () => size;
  mesh.resize = (minX, minY, minZ, maxX, maxY, maxZ) => {
    if (minX < maxX && minY < maxY && minZ < maxZ) {
      const geometries = [
        sidesGeometry.clone()
          .applyMatrix4(new THREE.Matrix4().makeScale(maxX - minX, maxY - minY, maxZ - minZ)),
      ];
      for (let ay = minY; ay < maxY; ay++) {
        for (let ax = minX; ax < maxX; ax++) {
          for (let az = minZ; az < maxZ; az++) {
            const newBlockGeometry = dotsGeometry.clone()
              .applyMatrix4(new THREE.Matrix4().makeTranslation(ax, ay, az));
            geometries.push(newBlockGeometry);
          }
        }
      }
      mesh.geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
    }
    size[0] = minX;
    size[1] = minY;
    size[2] = minZ;
    size[3] = maxX;
    size[4] = maxY;
    size[5] = maxZ;
  };
  mesh.resize(0, 0, 0, 1, 1, 1);
  return mesh;
})();
container.add(pointerMesh);

const _makeWasmWorker = () => {
  let cbs = [];
  const w = new Worker('mc-worker.js');
  w.onmessage = e => {
    const {data} = e;
    const {error, result} = data;
    cbs.shift()(error, result);
  };
  w.onerror = err => {
    console.warn(err);
  };
  w.request = (req, transfers) => new Promise((accept, reject) => {
    w.postMessage(req, transfers);

    cbs.push((err, result) => {
      if (!err) {
        accept(result);
      } else {
        reject(err);
      }
    });
  });
  return w;
};
const mcWorker = _makeWasmWorker();
const uvWorker = _makeWasmWorker();
let ammo = null;
(async () => {
  const p = makePromise();
  window.Module = { TOTAL_MEMORY: 100*1024*1024 };
  AmmoLib().then(Ammo => {
    Ammo.then = null;
    p.accept(Ammo);
  });
  const Ammo = await p;

  const localVector = new THREE.Vector3();
  const localQuaternion = new THREE.Quaternion();
  const ammoVector3 = new Ammo.btVector3();
  const ammoQuaternion = new Ammo.btQuaternion();
  const localTransform = new Ammo.btTransform();

  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  var overlappingPairCache = new Ammo.btDbvtBroadphase();
  var solver = new Ammo.btSequentialImpulseConstraintSolver();
  const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  dynamicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));

  {
    var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(100, 100, 100));

    var groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -100, 0));

    var mass = 0;
    var localInertia = new Ammo.btVector3(0, 0, 0);
    var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
  }

  const _makeConvexHullShape = object => {
    const shape = new Ammo.btConvexHullShape();
    // let numPoints = 0;
    object.updateMatrixWorld();
    object.traverse(o => {
      if (o.isMesh) {
        const {geometry} = o;
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          localVector.set(positions[i], positions[i+1], positions[i+2])
            // .applyMatrix4(o.matrixWorld);
          // console.log('point', localVector.x, localVector.y, localVector.z);
          ammoVector3.setValue(localVector.x, localVector.y, localVector.z);
          const lastOne = i >= (positions.length - 3);
          shape.addPoint(ammoVector3, lastOne);
          // numPoints++;
        }
      }
    });
    shape.setMargin(0);
    // console.log('sword points', numPoints);
    return shape;
  };

  let lastTimestamp = 0;
  ammo = {
    bindObjectMeshPhysics(objectMesh) {
      if (!objectMesh.body) {
        const shape = _makeConvexHullShape(objectMesh);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(objectMesh.position.x, objectMesh.position.y, objectMesh.position.z));

        const mass = 1;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);

        const myMotionState = new Ammo.btDefaultMotionState(transform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        dynamicsWorld.addRigidBody(body);

        objectMesh.body = body;
        objectMesh.ammoObjects = [
          transform,
          localInertia,
          myMotionState,
          rbInfo,
          body,
        ];
        objectMesh.originalPosition = objectMesh.position.clone();
        objectMesh.originalQuaternion = objectMesh.quaternion.clone();
        objectMesh.originalScale = objectMesh.scale.clone();
      }
    },
    unbindObjectMeshPhysics(objectMesh) {
      if (objectMesh.body) {
        dynamicsWorld.removeRigidBody(objectMesh.body);
        objectMesh.body = null;
        objectMesh.ammoObjects.forEach(o => {
          Ammo.destroy(o);
        });
        objectMesh.ammoObjects.length = null;

        objectMesh.position.copy(objectMesh.originalPosition);
        objectMesh.quaternion.copy(objectMesh.originalQuaternion);
        objectMesh.scale.copy(objectMesh.originalScale);
        objectMesh.originalPosition = null;
        objectMesh.originalQuaternion = null;
        objectMesh.originalScale = null;
      }
    },
    simulate() {
      const now = Date.now();
      if (lastTimestamp === 0) {
        lastTimestamp = now;
      }
      const timeDiff = now - lastTimestamp;

      dynamicsWorld.stepSimulation(timeDiff/1000, 2);

      lastTimestamp = now;
    },
    updateObjectMesh(mesh) {
      if (mesh.body) {
        mesh.body.getMotionState().getWorldTransform(localTransform);
        const origin = localTransform.getOrigin();
        mesh.position.set(origin.x(), origin.y(), origin.z());
        // console.log('mesh pos', mesh.position.toArray());
        const rotation = localTransform.getRotation();
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    },
  };
})();

const floorMesh = (() => {
  const geometry = new THREE.BoxBufferGeometry(3, 3, 3);
  const material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -3/2;
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  return mesh;
})();
container.add(floorMesh);

(() => {
  // precompile shader
  const tempScene = new THREE.Scene();
  const tempMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), objectMaterial);
  tempMesh.frustumCulled = false;
  tempScene.add(tempMesh);
  renderer.compile(tempMesh, camera);
})();
const _makeMiningMesh = (x, y, z) => {
  const geometry = new THREE.BufferGeometry();
  const material = objectMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.visible = false;
  // mesh.token = token;

  const dims = Float32Array.from([size, size, size]);
  const potential = new Float32Array(size*size*size);
  const potentialFillValue = 10;
  potential.fill(potentialFillValue);
  /* for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        if (
          x === 0 || y === 0 || z === 0 ||
          x === (size-1) || y === (size-1) || z === (size-1)
        ) {
          potential[x + y*size + z*size*size] = 0;
        }
      }
    }
  } */
  const brush = new Uint8Array(size*size*size*3);
  const shift = Float32Array.from([x*PARCEL_SIZE, y*PARCEL_SIZE, z*PARCEL_SIZE]);
  const scale = Float32Array.from([0.1, 0.1, 0.1]);

  mesh.x = x;
  mesh.y = y;
  mesh.z = z;
  mesh.potential = potential;
  mesh.brush = brush;
  // mesh.shift = shift;
  // mesh.scale = scale;
  mesh.contains = pos =>
    pos.x >= shift[0] &&
    pos.y >= shift[1] &&
    pos.z >= shift[2] &&
    pos.x < shift[0] + size &&
    pos.y < shift[1] + size &&
    pos.z < shift[2] + size;
  /* mesh.getPotential = pos => {
    const x = pos.x - shift[0];
    const y = pos.y - shift[1];
    const z = pos.z - shift[2];
    return potential[x + y*size*size + z*size];
  }; */
  let dirtyPos = false;
  mesh.set = (value, x, y, z) => {
    x -= mesh.x * PARCEL_SIZE;
    y -= mesh.y * PARCEL_SIZE;
    z -= mesh.z * PARCEL_SIZE;

    const factor = brushSize;
    const factor2 = Math.ceil(brushSize);
    const max = Math.max(Math.sqrt(factor*factor*3), 0.1);
    for (let dx = -factor2; dx <= factor2; dx++) {
      for (let dz = -factor2; dz <= factor2; dz++) {
        for (let dy = -factor2; dy <= factor2; dy++) {
          const ax = x + dx;
          const ay = y + dy;
          const az = z + dz;
          if (
            ax >= 0 &&
            ay >= 0 &&
            az >= 0 &&
            ax <= PARCEL_SIZE &&
            ay <= PARCEL_SIZE &&
            az <= PARCEL_SIZE
          ) {
            const index = ax + ay*size*size + az*size;
            const d = (max - Math.sqrt(dx*dx + dy*dy + dz*dz)) / max;
            potential[index] = value > 0 ? Math.min(potential[index], -d) : Math.max(potential[index], d);
            dirtyPos = true;
          }
        }
      }
    }
    if (value > 0) {
      for (let dx = -factor2; dx <= factor2; dx++) {
        for (let dz = -factor2; dz <= factor2; dz++) {
          for (let dy = -factor2; dy <= factor2; dy++) {
            const ax = x + dx;
            const ay = y + dy;
            const az = z + dz;
            if (ax >= 0 && ax <= PARCEL_SIZE && ay >= 0 && ay <= PARCEL_SIZE && az >= 0 && az <= PARCEL_SIZE) {
              const index2 = ax + ay*size*size + az*size;
              const xi = index2*3;
              const yi = index2*3+1;
              const zi = index2*3+2;
              // if ((dx === 0 && dy === 0 && dz === 0) || (brush[xi] === 0 && brush[yi] === 0 && brush[zi] === 0)) {
                brush[xi] = currentColor.r*255;
                brush[yi] = currentColor.g*255;
                brush[zi] = currentColor.b*255;
                dirtyPos = true;
              // }
            }
          }
        }
      }
    }
  };
  mesh.paint = mesh.set.bind(mesh, 1);
  mesh.erase = mesh.set.bind(mesh, -1);
  mesh.color = (x, y, z, c) => {
    x -= mesh.x * PARCEL_SIZE;
    y -= mesh.y * PARCEL_SIZE;
    z -= mesh.z * PARCEL_SIZE;

    const factor = brushSize;
    const factor2 = Math.ceil(brushSize);
    for (let dx = -factor2; dx <= factor2; dx++) {
      for (let dz = -factor2; dz <= factor2; dz++) {
        for (let dy = -factor2; dy <= factor2; dy++) {
          const ax = x + dx;
          const ay = y + dy;
          const az = z + dz;
          if (ax >= 0 && ax <= PARCEL_SIZE && ay >= 0 && ay <= PARCEL_SIZE && az >= 0 && az <= PARCEL_SIZE) {
            const index2 = ax + ay*size*size + az*size;
            const xi = index2*3;
            const yi = index2*3+1;
            const zi = index2*3+2;
            // if ((dx === 0 && dy === 0 && dz === 0) || (brush[xi] === 0 && brush[yi] === 0 && brush[zi] === 0)) {
              brush[xi] = currentColor.r*255;
              brush[yi] = currentColor.g*255;
              brush[zi] = currentColor.b*255;
              dirtyPos = true;
            // }
          }
        }
      }
    }
  };
  let positions = null;
  mesh.refresh = () => {
    if (dirtyPos) {
      dirtyPos = false;

      const arrayBuffer = new ArrayBuffer(300*1024);
      return mcWorker.request({
        method: 'march',
        dims,
        potential,
        brush,
        shift,
        scale,
        arrayBuffer,
      }, [arrayBuffer]).then(res => () => {
        if (res.positions.length > 0) {
          geometry.setAttribute('position', new THREE.BufferAttribute(res.positions, 3));
          geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(res.positions.length*2/3), 2));
          geometry.setAttribute('color', new THREE.BufferAttribute(res.colors, 3));
          geometry.deleteAttribute('normal');
          geometry.setIndex(new THREE.BufferAttribute(res.faces, 1));
          geometry.computeVertexNormals();
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      });
    } else {
      return Promise.resolve(() => {});
    }
  };
  /* mesh.collide = () => {
    if (mesh.visible) {
      return mcWorker.request({
        method: 'collide',
        positions: geometry.attributes.position.array,
        origin: localRaycaster.ray.origin.toArray(new Float32Array(3)),
        direction: localRaycaster.ray.direction.toArray(new Float32Array(3))
      }).then(result => () => {
        // console.log('collide', !isNaN(result.collision[0]));
        if (!isNaN(result.collision[0])) {
          collisionMesh.position.fromArray(result.collision);
          collisionMesh.visible = true;

          const oldColorAttribute = geometry.attributes.color.old || geometry.attributes.color;
          const oldColors = oldColorAttribute.array;
          const newColors = Float32Array.from(oldColors);
          for (let i = 0; i < 3; i++) {
            newColors[result.collisionIndex + i*3] = currentColor.r;
            newColors[result.collisionIndex + i*3 + 1] = currentColor.g;
            newColors[result.collisionIndex + i*3 + 2] = currentColor.b;
          }
          geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
          geometry.attributes.color.old = oldColorAttribute;
        } else {
          collisionMesh.visible = false;

          const oldColorAttribute = geometry.attributes.color.old;
          if (oldColorAttribute) {
            geometry.setAttribute('color', oldColorAttribute);
          }
        }
      });
    } else {
      return Promise.resolve(() => {});
    }
  };
  mesh.update = () => {
    if (!colliding && geometry.attributes.position) {
      colliding = true;

      const controllerMesh = controllerMeshes[1]; // XXX make this work for all controllers
      mcWorker.request({
        method: 'collide',
        positions: geometry.attributes.position.array,
        indices: geometry.index.array,
        origin: controllerMesh.ray.origin.toArray(new Float32Array(3)),
        direction: controllerMesh.ray.direction.toArray(new Float32Array(3)),
      })
        .then(collision => {
          material.uniforms.uSelect.value.fromArray(collision);
        })
        .catch(err => {
          console.warn(err.stack);
        })
        .finally(() => {
          colliding = false;
        });
    }
  };
  mesh.intersect = ray => {
    if (isFinite(material.uniforms.uSelect.value.x)) {
      const intersectionPoint = material.uniforms.uSelect.value.clone();
      const distance = ray.origin.distanceTo(intersectionPoint);
      return {
        type: 'mine',
        mesh,
        intersectionPoint,
        distance,
      };
    } else {
      return null;
    }
  };
  mesh.setDirty = () => {
    dirtyPos = true;
  };
  mesh.reset = () => {
    potential.fill(potentialFillValue);
    brush.fill(0);
    dirtyPos = true;
  }; */
  mesh.destroy = () => {
    geometry.dispose();
    material.dispose();
  };

  return mesh;
};
let miningMeshes = [];
const _findMiningMeshByIndex = (x, y, z) => miningMeshes.find(miningMesh => miningMesh.x === x && miningMesh.y === y && miningMesh.z === z);
const _findOrAddMiningMeshesByContainCoord = (x, y, z) => {
  const result = [];
  const miningMesh = _findMiningMeshByIndex(x, y, z);
  miningMesh && result.push(miningMesh);
  const factor = 1;
  for (let dx = -factor; dx <= factor; dx++) {
    const ax = Math.floor(x + dx*0.5);
    for (let dz = -factor; dz <= factor; dz++) {
      const az = Math.floor(z + dz*0.5);
      for (let dy = -factor; dy <= factor; dy++) {
        const ay = Math.floor(y + dy*0.5);
        let miningMesh = _findMiningMeshByIndex(ax, ay, az);
        if (!miningMesh) {
          miningMesh = _makeMiningMesh(ax, ay, az);
          container.add(miningMesh);
          miningMeshes.push(miningMesh);
        }
        !result.includes(miningMesh) && result.push(miningMesh);
      }
    }
  }
  return result;
};
const _newMiningMeshes = () => {
  for (let i = 0; i < miningMeshes.length; i++) {
    const miningMesh = miningMeshes[i];
    container.remove(miningMesh);
    miningMesh.destroy();
  }
  miningMeshes.length = 0;
  _refreshMiningMeshes();
};
const objectMeshes = [];
const _centerObjectMesh = objectMesh => {
  const center = new THREE.Box3()
    .setFromObject(objectMesh)
    .getCenter(new THREE.Vector3());
  objectMesh.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  objectMesh.position.copy(center);
};
const _parameterizeObjectMesh = objectMesh => {
  const {geometry} = objectMesh;
  const arrayBuffer = new ArrayBuffer(300*1024);
  return uvWorker.request({
    method: 'uvParameterize',
    positions: geometry.attributes.position.array,
    normals: geometry.attributes.color.array,
    faces: geometry.index.array,
    arrayBuffer,
  }, [arrayBuffer]).then(res => {
    geometry.setAttribute('position', new THREE.BufferAttribute(res.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(res.normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(res.uvs, 2));
    geometry.deleteAttribute('normal');
    geometry.setIndex(new THREE.BufferAttribute(res.faces, 1));
    geometry.computeVertexNormals();
  });
};
let committing = false;
let commitQueued = false;
const _commitMiningMeshes = async () => {
  if (!committing) {
    committing = true;

    await _waitForMiningMesh();

    const visibleMiningMeshes = miningMeshes.filter(miningMesh => miningMesh.visible);
    if (visibleMiningMeshes.length) {
      const geometry = BufferGeometryUtils.mergeBufferGeometries(visibleMiningMeshes.map(miningMesh => miningMesh.geometry));
      const objectMesh = makeObjectMeshFromGeometry(geometry, null, null);
      await _parameterizeObjectMesh(objectMesh);
      _centerObjectMesh(objectMesh);
      _newMiningMeshes();

      const action = createAction('addObject', {
        objectMesh,
        container,
        objectMeshes,
      });
      execute(action);
    }

    committing = false;
    if (commitQueued) {
      commitQueued = false;
      _commitMiningMeshes();
    }
  } else {
    commitQueued = true;
  }
};
const _centerObjectMeshes = () => {
  const box = new THREE.Box3();
  for (let i = 0; i < objectMeshes.length; i++) {
    const localBox = new THREE.Box3()
      .setFromObject(objectMeshes[i]);
    box.min.x = Math.min(box.min.x, localBox.min.x);
    box.min.y = Math.min(box.min.y, localBox.min.y);
    box.min.z = Math.min(box.min.z, localBox.min.z);
    box.max.x = Math.max(box.max.x, localBox.max.x);
    box.max.y = Math.max(box.max.y, localBox.max.y);
    box.max.z = Math.max(box.max.z, localBox.max.z);
  }
  const center = box.getCenter(new THREE.Vector3());
  center.sub(new THREE.Vector3(0, 0.5, 0));
  if (box.max.x - box.min.x < 1) {
    center.sub(new THREE.Vector3(0.5, 0, 0));
  } else {
    center.x -= Math.ceil(box.max.x - box.min.x - 1);
  }
  if (box.max.z - box.min.z < 1) {
    center.sub(new THREE.Vector3(0, 0, 0.5));
  } else {
    center.z -= Math.ceil(box.max.z - box.min.z - 1);
  }
  for (let i = 0; i < objectMeshes.length; i++) {
    objectMeshes[i].position.sub(center);
  }

  const gridBox = box.clone();
  gridBox.min.sub(center);
  gridBox.max.sub(center);
  gridBox.min.x = Math.floor(gridBox.min.x);
  gridBox.min.y = Math.floor(gridBox.min.y);
  gridBox.min.z = Math.floor(gridBox.min.z);
  gridBox.max.x = Math.floor(gridBox.max.x);
  gridBox.max.y = Math.floor(gridBox.max.y);
  gridBox.max.z = Math.floor(gridBox.max.z);
  pointerMesh.resize(gridBox.min.x, gridBox.min.y, gridBox.min.z, gridBox.max.x+1, gridBox.max.y+1, gridBox.max.z+1);
};
const _screenshotMiningMeshes = async () => {
  const newScene = new THREE.Scene();
  {
    const ambientLight = new THREE.AmbientLight(0x808080);
    newScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0.5, 1, 0.5).multiplyScalar(100);
    newScene.add(directionalLight);
  }
  for (let i = 0; i < objectMeshes.length; i++) {
    newScene.add(objectMeshes[i]);
  }
  newScene.add(pointerMesh);

  const width = 256;
  const height = width;
  const center = new THREE.Vector3(0.5, 0.5, 0.5);
  const gif = new GIF({
    workers: 2,
    quality: 10,
  });
  for (let i = 0; i < Math.PI*2; i += Math.PI*0.05) {
    const position = new THREE.Vector3(0.5, 1, 0.5).add(new THREE.Vector3(Math.cos(i + Math.PI/2), 0, Math.sin(i + Math.PI/2)));
    const canvas = screenshot(newScene, position, center, {
      width,
      height,
    });
    gif.addFrame(canvas, {delay: 50});
  }
  gif.render();

  for (let i = 0; i < objectMeshes.length; i++) {
    container.add(objectMeshes[i]);
  }
  container.add(pointerMesh);

  const blob = await new Promise((accept, reject) => {
    gif.on('finished', accept);
  });
  return blob;
};
const _paintMiningMeshes = (x, y, z) => {
  const miningMeshes = _findOrAddMiningMeshesByContainCoord(x/PARCEL_SIZE, y/PARCEL_SIZE, z/PARCEL_SIZE);
  miningMeshes.forEach(miningMesh => {
    miningMesh.paint(x, y, z);
  });
};
const _eraseMiningMeshes = (x, y, z) => {
  const miningMesh = _findOrAddMiningMeshesByContainCoord(x/PARCEL_SIZE, y/PARCEL_SIZE, z/PARCEL_SIZE);
  miningMeshes.forEach(miningMesh => {
    miningMesh.erase(x, y, z);
  });
};
const _colorMiningMeshes = (x, y, z, c) => {
  const miningMesh = _findOrAddMiningMeshesByContainCoord(x/PARCEL_SIZE, y/PARCEL_SIZE, z/PARCEL_SIZE);
  miningMeshes.forEach(miningMesh => {
    miningMesh.color(x, y, z, c);
  });
};
let refreshing = false;
let refreshQueued = false;
const refreshCbs = [];
const _refreshMiningMeshes = async () => {
  if (!refreshing) {
    refreshing = true;

    const fns = await Promise.all(miningMeshes.map(miningMesh => miningMesh.refresh()));
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
    const commitTool = Array.from(tools).find(tool => tool.matches('[tool=commit]'));
    if (miningMeshes.some(miningMesh => miningMesh.visible)) {
      commitTool.classList.remove('hidden');
    } else {
      commitTool.classList.add('hidden');
    }

    refreshing = false;
    if (refreshQueued) {
      refreshQueued = false;
      _refreshMiningMeshes();
    } else {
      for (let i = 0; i < refreshCbs.length; i++) {
        refreshCbs[i]();
      }
      refreshCbs.length = 0;
    }
  } else {
    refreshQueued = true;
  }
};
const _waitForMiningMesh = async () => {
  if (refreshing) {
    const p = makePromise();
    refreshCbs.push(p.accept);
    await p;
  }
};
/* let colliding = false;
let collideQueued = false;
const _collideMiningMeshes = async () => {
  if (!colliding) {
    colliding = true;

    const fns = await Promise.all(miningMeshes.map(miningMesh => miningMesh.collide()));
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }

    colliding = false;
    if (collideQueued) {
      collideQueued = false;
      _collideMiningMeshes();
    }
  } else {
    collideQueued = true;
  }
}; */
const _bindObjectMeshPhysics = async () => {
  for (let i = 0; i < objectMeshes.length; i++) {
    ammo.bindObjectMeshPhysics(objectMeshes[i]);
  }
};
const _unbindObjectMeshPhysics = async () => {
  for (let i = 0; i < objectMeshes.length; i++) {
    ammo.unbindObjectMeshPhysics(objectMeshes[i]);
  }
};
const objectState = makeObjectState();

const collisionMesh = (() => {
  const geometry = new THREE.BoxBufferGeometry(0.01, 0.01, 0.01);
  const material = new THREE.MeshPhongMaterial({
    color: 0x0000FF,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  mesh.frustumCulled = false;
  return mesh;
})();
container.add(collisionMesh);

const hoverOutlineEffect = new OutlineEffect(renderer, {
  defaultThickness: 0.01,
  defaultColor: new THREE.Color(0x42a5f5).toArray(),
  defaultAlpha: 0.5,
  // defaultKeepAlive: false,//true,
});
const selectOutlineEffect = new OutlineEffect(renderer, {
  defaultThickness: 0.01,
  defaultColor: new THREE.Color(0x66bb6a).toArray(),
  defaultAlpha: 0.5,
  // defaultKeepAlive: false,//true,
});
const outlineScene = new THREE.Scene();
let renderingOutline = false;
let hoveredObjectMesh = null;
let selectedObjectMesh = null;
const _setHoveredObjectMesh = newHoveredObjectMesh => {
  hoveredObjectMesh = newHoveredObjectMesh;
};
const _setSelectedObjectMesh = newSelectedObjectMesh => {
  if (!selectedObjectMesh && hoveredObjectMesh === selectedObjectMesh) {
    hoveredObjectMesh = null;
  }
  if (selectedObjectMesh) {
    _unbindObjectMeshControls(selectedObjectMesh);
  }
  selectedObjectMesh = newSelectedObjectMesh;
  if (selectedObjectMesh) {
    _bindObjectMeshControls(selectedObjectMesh);
  }
};
scene.onAfterRender = () => {
  if (renderingOutline) return;
  renderingOutline = true;

  outlineScene.position.copy(container.position);
  outlineScene.quaternion.copy(container.quaternion);
  outlineScene.scale.copy(container.scale);

  let oldHoverParent;
  if (hoveredObjectMesh) {
    oldHoverParent = hoveredObjectMesh.parent;
    outlineScene.add(hoveredObjectMesh);
  }
  hoverOutlineEffect.renderOutline(outlineScene, camera);
  if (oldHoverParent) {
    container.add(hoveredObjectMesh);
  }

  let oldSelectedParent;
  if (selectedObjectMesh) {
    oldSelectedParent = selectedObjectMesh.parent;
    outlineScene.add(selectedObjectMesh);
  }
  selectOutlineEffect.renderOutline(outlineScene, camera);
  if (oldSelectedParent) {
    container.add(selectedObjectMesh);
  }

  renderingOutline = false;
};

window.addEventListener('resize', e => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

interfaceDocument.addEventListener('dragover', e => {
  e.preventDefault();
});
const _handleUpload = file => {
  if (/^image\//.test(file.type)) {
    const objectMesh = (() => {
      // const geometry = new THREE.PlaneBufferGeometry(1, 1);
      const geometry = new THREE.BoxBufferGeometry(1, 1, 0.001);
      for (let i = 0; i < geometry.attributes.position.array.length; i += 3) {
        if (geometry.attributes.position.array[i + 2] < 0) {
          const j = i*2/3;
          geometry.attributes.uv.array[j] = 1 - geometry.attributes.uv.array[j];
        }
      }
      const colors = new Float32Array(geometry.attributes.position.array.length);
      colors.fill(1)
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        texture.image = img;
        texture.needsUpdate = true;

        mesh.scale.x = 0.5;
        mesh.scale.y = mesh.scale.x * img.height/img.width;
        mesh.visible = true;
      };
      img.onerror = console.warn;

      const texture = new THREE.Texture();
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;

      const mesh = makeObjectMeshFromGeometry(geometry, texture, null);
      return mesh;
    })();
    objectMesh.position.copy(camera.position)
      .add(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
    objectMesh.quaternion.copy(camera.quaternion);
    container.add(objectMesh);
    objectMeshes.push(objectMesh);
  }
};
interfaceDocument.addEventListener('drop', e => {
  e.preventDefault();

  if (e.dataTransfer.files.length > 0){
    const [file] = e.dataTransfer.files;
    _handleUpload(file);
  }
});

let transformControlsHovered = false;
const _bindObjectMeshControls = o => {
  const control = new TransformControls(camera, interfaceDocument.querySelector('.background'), interfaceDocument);
  // control.setMode(transformMode);
  control.size = 3;
  // control.visible = toolManager.getSelectedElement() === xrIframe;
  // control.enabled = control.visible;
  /* control.addEventListener('dragging-changed', e => {
    orbitControls.enabled = !e.value;
  }); */
  control.addEventListener('mouseEnter', () => {
    transformControlsHovered = true;
  });
  control.addEventListener('mouseLeave', () => {
    transformControlsHovered = false;
  });
  const _snapshotTransform = o => ({
    position: o.position.clone(),
    quaternion: o.quaternion.clone(),
    scale: o.scale.clone(),
  });
  let lastTransform = _snapshotTransform(o);
  let changed = false;
  control.addEventListener('mouseDown', () => {
    lastTransform = _snapshotTransform(o);
  });
  control.addEventListener('mouseUp', () => {
    if (changed) {
      changed = false;

      const newTransform = _snapshotTransform(o);
      const action = createAction('transform', {
        object: o,
        oldTransform: lastTransform,
        newTransform,
      });
      execute(action);
      lastTransform = newTransform;
    }
  });
  control.addEventListener('objectChange', e => {
    changed = true;
  });
  control.attach(o);
  scene.add(control);
  o.control = control;
};
const _unbindObjectMeshControls = o => {
  scene.remove(o.control);
  o.control.dispose();
  o.control = null;
  transformControlsHovered = false;
};

const localRaycaster = new THREE.Raycaster();
let toolDown = false;
let toolGrip = false;
const _updateRaycasterFromMouseEvent = (raycaster, e) => {
  const mouse = new THREE.Vector2(( ( e.clientX ) / window.innerWidth ) * 2 - 1, - ( ( e.clientY ) / window.innerHeight ) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  if (selectedTool === 'brush') {
    raycaster.ray.origin.add(raycaster.ray.direction);
  }
};
const _updateRaycasterFromObject = (raycaster, o) => {
  raycaster.ray.origin.copy(o.position);
  raycaster.ray.direction.set(0, 0, -1).applyQuaternion(o.quaternion);
};
let hoveredObjectFace = null;
let hoveredObjectPaint = null;
const _updateTool = raycaster => {
  if (selectedTool === 'brush' || selectedTool === 'erase') {
    const targetPosition = raycaster.ray.origin;
    pointerMesh.material.uniforms.targetPos.value.set(
      Math.floor(targetPosition.x*10),
      Math.floor(targetPosition.y*10),
      Math.floor(targetPosition.z*10)
    );
    if (toolDown) {
      const v = pointerMesh.material.uniforms.targetPos.value;
      if (selectedTool === 'brush') {
        _paintMiningMeshes(v.x+1, v.y+1, v.z+1);
      } else if (selectedTool === 'erase') {
        _eraseMiningMeshes(v.x+1, v.y+1, v.z+1);
      }
      _refreshMiningMeshes();
    }
  } else if (selectedTool === 'select') {
    if (!toolGrip || !hoveredObjectMesh) {
      const intersections = raycaster.intersectObjects(objectMeshes);
      if (intersections.length > 0) {
        _setHoveredObjectMesh(intersections[0].object);
      } else {
        _setHoveredObjectMesh(null);
      }
    } else {
      if (!transformControlsHovered) {
        console.log('drag');
      }
    }
  } else if (selectedTool === 'paint') {
    const intersections = raycaster.intersectObjects(objectMeshes);
    if (intersections.length > 0) {
      const [{point}] = intersections;
      collisionMesh.position.copy(point);
      collisionMesh.visible = true;
    } else {
      collisionMesh.visible = false;
    }
  } else if (selectedTool === 'pencil') {
    const intersections = raycaster.intersectObjects(objectMeshes);
    if (intersections.length > 0) {
      const [{object, point, faceIndex, uv}] = intersections;

      if (toolDown) {
        let texture = object.material.map;
        let {image: canvas} = texture;
        if (!canvas.ctx) {
          const oldCanvas = canvas;
          canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.ctx = ctx;

          if (oldCanvas.nodeName === 'IMG') {
            canvas.width = oldCanvas.width;
            canvas.height = oldCanvas.height;
            ctx.drawImage(oldCanvas, 0, 0, oldCanvas.width, oldCanvas.height);
          } else {
            canvas.width = 2048;
            canvas.height = 2048;
            ctx.fillStyle = 'rgba(255, 255, 255, 255)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.lineJoin = ctx.lineCap = 'round';

          object.material.map.image = canvas;
          object.material.map.needsUpdate = true;
        }
        const {ctx} = canvas;
        const x = uv.x * canvas.width;
        const y = uv.y * canvas.height;

        if (
          hoveredObjectPaint &&
          (
            faceIndex === hoveredObjectPaint.faceIndex ||
            Math.sqrt(sq(x - hoveredObjectPaint.lastX), sq(y - hoveredObjectPaint.lastY)) < 100
          )
        ) {
          // nothing
        } else {
          hoveredObjectPaint = null;
        }

        if (!hoveredObjectPaint) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        }

        ctx.strokeStyle = '#' + currentColor.getHexString();
        ctx.lineWidth = getRandomInt(7, 9);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        hoveredObjectPaint = {
          lastX: x,
          lastY: y,
          faceIndex,
        };
        texture.needsUpdate = true;
      } else {
        hoveredObjectPaint = null;
      }

      collisionMesh.position.copy(point);
      collisionMesh.visible = true;
    } else {
      collisionMesh.visible = false;
    }
  } else if (selectedTool === 'scalpel') {
    if (toolDown) {
      scalpelMesh.endPosition.copy(localRaycaster.ray.origin)
        .add(localRaycaster.ray.direction);
      const normal = scalpelMesh.endPosition.clone()
        .sub(scalpelMesh.startPosition);
      if (normal.length() > 0.001) {
        normal
          .cross(localRaycaster.ray.direction);
        scalpelMesh.position.copy(scalpelMesh.startPosition)
          .add(scalpelMesh.endPosition)
          .divideScalar(2);
      } else {
        normal.set(1, 0, 0)
          .cross(scalpelMesh.startDirection);
        scalpelMesh.position.copy(scalpelMesh.startPosition);
      }
      normal.normalize();
      scalpelMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    }
  }
  
  const intersections = raycaster.intersectObject(uiMesh);
  if (intersections.length > 0 && intersections[0].distance < 3) {
    const [{distance, uv}] = intersections;
    rayMesh.position.copy(raycaster.ray.origin);
    rayMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), raycaster.ray.direction);
    rayMesh.scale.z = distance;
    rayMesh.visible = true;

    // orbitControls.enabled = false;

    uiMesh.intersect(uv);
  } else {
    rayMesh.visible = false;
    
    // orbitControls.enabled = selectedTool === 'camera';

    uiMesh.intersect(null);
  }
};
let objectMeshOldCanvases = [];
const _snapshotCanvases = objectMeshes => objectMeshes.map(objectMesh => {
  const oldImage = objectMesh.material.map.image;
  if (oldImage !== objectImage) {
    const canvas = document.createElement('canvas');
    canvas.width = oldImage.width;
    canvas.height = oldImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(oldImage, 0, 0, oldImage.width, oldImage.height);
    return canvas;
  } else {
    return null;
  }
});
let scalpelMesh = (() => {
  const geometry = new THREE.BoxBufferGeometry(10, 0.001, 10);
  const material = new THREE.MeshBasicMaterial({
    color: 0x42a5f5,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.startPosition = new THREE.Vector3();
  mesh.startDirection = new THREE.Vector3();
  mesh.endPosition = new THREE.Vector3();
  return mesh;
})();
container.add(scalpelMesh);
const _beginTool = (primary, secondary) => {
  if (primary) {
    if (uiMesh.click()) {
      // nothing
    } else {
      if (selectedTool === 'brush') {
        const v = pointerMesh.material.uniforms.targetPos.value;
        _paintMiningMeshes(v.x+1, v.y+1, v.z+1);
        _refreshMiningMeshes();
      } else if (selectedTool === 'erase') {
        const v = pointerMesh.material.uniforms.targetPos.value;
        _eraseMiningMeshes(v.x+1, v.y+1, v.z+1);
        _refreshMiningMeshes();
      } else if (selectedTool === 'select') {
        if (!transformControlsHovered) {
          _setSelectedObjectMesh(hoveredObjectMesh);
        }
      } else if (selectedTool === 'paint') {
        const intersections = localRaycaster.intersectObjects(objectMeshes);
        if (intersections.length > 0) {
          const [{object}] = intersections;

          const oldColor = new THREE.Color().fromArray(object.geometry.attributes.color.array);
          const newColor = currentColor.clone();
          const action = createAction('paint', {
            objectMesh: object,
            oldColor,
            newColor,
          });
          execute(action);
        }
      } else if (selectedTool === 'pencil') {
        objectMeshOldCanvases = _snapshotCanvases(objectMeshes);
      } else if (selectedTool === 'scalpel') {
        scalpelMesh.startPosition.copy(localRaycaster.ray.origin)
          .add(localRaycaster.ray.direction);
        scalpelMesh.startDirection.copy(localRaycaster.ray.direction);
        scalpelMesh.position.copy(scalpelMesh.startPosition);
        const normal = new THREE.Vector3(1, 0, 0)
          .cross(scalpelMesh.startDirection)
          .normalize();
        scalpelMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        scalpelMesh.visible = true;
      }

      toolDown = true;
    }
  }
  if (secondary) {
    if (selectedTool === 'select') {
      if (!transformControlsHovered) {
        _setSelectedObjectMesh(hoveredObjectMesh);
      }
    }
    toolGrip = true;
  }
};
const _endTool = (primary, secondary) => {
  if (primary) {
    if (selectedTool === 'pencil') {
      const objectMeshNewCanvases = _snapshotCanvases(objectMeshes);
      const action = createAction('pencil', {
        objectMeshes,
        oldCanvases: objectMeshOldCanvases,
        newCanvases: objectMeshNewCanvases,
      });
      pushAction(action);
    } else if (selectedTool === 'scalpel') {
      scalpelMesh.visible = false;

      if (selectedObjectMesh) {
        _splitObjectMesh(selectedObjectMesh, scalpelMesh.position.clone().sub(selectedObjectMesh.position), scalpelMesh.quaternion, scalpelMesh.scale);
      }
    }

    toolDown = false;
  }
  if (secondary) {
    toolGrip = false;
  }
};
let clipboardObjectMesh = null;
const _clipboardCopy = objectMesh => {
  clipboardObjectMesh = {
    geometry: objectMesh.geometry.clone(),
    texture: objectMesh.map && objectMesh.map.clone(),
    matrix: objectMesh.matrix.clone(),
  };
};
const _clipboardPaste = () => {
  if (clipboardObjectMesh) {
    const objectMesh = makeObjectMeshFromGeometry(clipboardObjectMesh.geometry, clipboardObjectMesh.texture, clipboardObjectMesh.matrix);

    const action = createAction('addObject', {
      objectMesh,
      container,
      objectMeshes,
    });
    execute(action);
  }
};
const _splitObjectMesh = (objectMesh, p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1)) => {
  const {geometry} = objectMesh;
  const arrayBuffer = new ArrayBuffer(300*1024);
  const position = objectMesh.position.clone();
  const quaternion = objectMesh.quaternion.clone();
  const scale = objectMesh.scale.clone();
  const color = new THREE.Color().fromArray(objectMesh.geometry.attributes.color.array);
  uvWorker.request({
    method: 'cut',
    positions: geometry.attributes.position.array,
    faces: geometry.index.array,
    position: p.toArray(),
    quaternion: q.toArray(),
    scale: s.toArray(),
    arrayBuffer,
  }, [arrayBuffer]).then(res => {
    const newObjectMeshes = [];
    {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(res.positions, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(res.positions.length*2/3), 2));
      const colors = new Float32Array(res.positions.length);
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = color.r;
        colors[i+1] = color.g;
        colors[i+2] = color.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.deleteAttribute('normal');
      geometry.setIndex(new THREE.BufferAttribute(res.faces, 1));
      geometry.computeVertexNormals();
      const objectMesh = makeObjectMeshFromGeometry(geometry, null, null);
      objectMesh.position.copy(position);
      objectMesh.quaternion.copy(quaternion);
      objectMesh.scale.copy(scale);
      newObjectMeshes.push(objectMesh);
    }
    {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(res.positions2, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(res.positions2.length*2/3), 2));
      const colors = new Float32Array(res.positions2.length);
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = color.r;
        colors[i+1] = color.g;
        colors[i+2] = color.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.deleteAttribute('normal');
      geometry.setIndex(new THREE.BufferAttribute(res.faces2, 1));
      geometry.computeVertexNormals();
      const objectMesh = makeObjectMeshFromGeometry(geometry, null, null);
      objectMesh.position.copy(position);
      objectMesh.quaternion.copy(quaternion);
      objectMesh.scale.copy(scale);
      newObjectMeshes.push(objectMesh);
    }

    _setHoveredObjectMesh(null);
    _setSelectedObjectMesh(null);

    const action = createAction('swapObjects', {
      oldObjectMeshes: [objectMesh],
      newObjectMeshes,
      container,
      objectMeshes,
    });
    execute(action);
  });
};
[window, interfaceWindow].forEach(w => {
  w.addEventListener('keydown', e => {
    switch (e.which) {
      case 49: // 1
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57: // 9
      {
        tools[e.which - 49].click();
        break;
      }
      case 87: { // W
        selectedObjectMesh && selectedObjectMesh.control.setMode('translate');
        break;
      }
      case 69: { // E
        selectedObjectMesh && selectedObjectMesh.control.setMode('rotate');
        break;
      }
      case 82: { // R
        selectedObjectMesh && selectedObjectMesh.control.setMode('scale');
        break;
      }
      case 83: { // S
        if (e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();

          interfaceDocument.getElementById('save-op').click();
        }
        break;
      }
      case 79: { // O
        if (e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();

          interfaceDocument.getElementById('load-op-input').click();
        }
        break;
      }
      case 88: { // X
        if (e.ctrlKey) {
          if (selectedObjectMesh) {
            _clipboardCopy(selectedObjectMesh);
            
            const oldSelectedObjectMesh = selectedObjectMesh;

            _setHoveredObjectMesh(null);
            _setSelectedObjectMesh(null);

            const action = createAction('removeObject', {
              objectMesh: oldSelectedObjectMesh,
              container,
              objectMeshes,
            });
            execute(action);
          }
        }
        break;
      }
      case 75: { // K
        if (e.ctrlKey) {
          if (selectedObjectMesh) {
            _splitObjectMesh(selectedObjectMesh);
          }
        }
        break;
      }
      case 67: { // C
        if (e.ctrlKey) {
          if (selectedObjectMesh) {
            _clipboardCopy(selectedObjectMesh);
          }
        } else if (e.shiftKey) {
          _centerObjectMeshes();
        }
        break;
      }
      case 86: { // V
        if (e.ctrlKey) {
          _clipboardPaste();
        }
        break;
      }
      case 90: { // Z
        if (e.ctrlKey) {
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
      }
      case 89: { // Y
        if (e.ctrlKey) {
          redo();
        }
        break;
      }
      case 27: { // esc
        _setSelectedObjectMesh(null);
        break;
      }
      case 8: // backspace
      case 46: // del
      {
        if (selectedObjectMesh) {
          const oldSelectedObjectMesh = selectedObjectMesh;

          _setHoveredObjectMesh(null);
          _setSelectedObjectMesh(null);

          const action = createAction('removeObject', {
            objectMesh: oldSelectedObjectMesh,
            container,
            objectMeshes,
          });
          execute(action);
        }
        break;
      }
    }
  });
  w.addEventListener('mousemove', e => {
    _updateRaycasterFromMouseEvent(localRaycaster, e);
    _updateTool(localRaycaster);
  });
  w.addEventListener('mousedown', _beginTool.bind(null, true, true));
  w.addEventListener('mouseup', _endTool.bind(null, true, true));
});
const _updateControllers = () => {
  if (gripDowns.every(gripDown => gripDown)) {
    // XXX
  }
};

// interface

const tools = interfaceDocument.querySelectorAll('.tool');
Array.from(tools).forEach((tool, i) => {
  tool.addEventListener('mousedown', e => {
    e.stopPropagation();
  });
  tool.addEventListener('click', e => {
    const _cancel = () => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (tool.matches('[tool=commit]')) {
      _cancel();
      _commitMiningMeshes();
    } else if (tool.matches('[tool=image]')) {
      // nothing
    } else if (tool.matches('[sidebar]')) {
      const wasOpen = tool.classList.contains('open');

      Array.from(tools)
        .filter(tool => tool.matches('[sidebar]'))
        .forEach(sidebar => {
          sidebar.classList.remove('open');
        });
      [
        'script-input',
        // 'shader-input',
      ].forEach(id => interfaceDocument.getElementById(id).classList.remove('open'));

      if (tool.matches('[tool=script]')) {
        interfaceDocument.getElementById('script-input').classList.toggle('open', !wasOpen);
      } /* else if (tool.matches('[tool=shader]')) {
        interfaceDocument.getElementById('shader-input').classList.toggle('open', !wasOpen);
      } */

      tool.classList.toggle('open', !wasOpen);
    } else if (tool.matches('[tool=center]')) {
      _cancel();
      _centerObjectMeshes();
    } else {
      _cancel();
      const newTool = tool.getAttribute('tool');
      if (newTool !== selectedTool) {
        Array.from(tools).forEach(tool => {
          tool.classList.remove('selected');
        });
        selectedTool = newTool;
        tool.classList.add('selected');
        
        uiMesh.update();
        
        orbitControls.enabled = selectedTool === 'camera';
        
        _commitMiningMeshes();

        if (!['camera', 'scalpel'].includes(selectedTool)) {
          _setHoveredObjectMesh(null);
          _setSelectedObjectMesh(null);
        }
      }
    }
  });
});
let selectedTool = tools[0].getAttribute('tool');
tools[0].classList.add('selected');

const _bindUploadFileButton = (inputFileEl, handleUpload) => {
  inputFileEl.addEventListener('change', async e => {
    const {files} = e.target;
    if (files.length === 1) {
      const [file] = files;
      handleUpload(file);
    }

    const {parentNode} = inputFileEl;
    parentNode.removeChild(inputFileEl);
    const newInputFileEl = inputFileEl.ownerDocument.createElement('input');
    newInputFileEl.type = 'file';
    // newInputFileEl.id = 'upload-file-button';
    newInputFileEl.style.display = 'none';
    parentNode.appendChild(newInputFileEl);
    _bindUploadFileButton(newInputFileEl);
  });
};
_bindUploadFileButton(Array.from(tools).find(tool => tool.matches('[tool=image]')).querySelector('input[type=file]'), _handleUpload);

interfaceDocument.getElementById('script-input').addEventListener('mousedown', e => {
  e.stopPropagation();
});
const scriptInputTextarea = interfaceDocument.getElementById('script-input-textarea');
scriptInputTextarea.value = `renderer.addEventListener('tick', () => {
  // console.log('tick');
  objects.forEach(object => {
    object.position.y = 0.5 + Math.sin((Date.now() % 2000)/2000 * Math.PI*2);
  });
});`;
scriptInputTextarea.addEventListener('input', e => {
  if (scriptsBound) {
    bindObjectScript(objectState, e.target.value, objectMeshes);
  }
});
scriptInputTextarea.addEventListener('keydown', e => {
  e.stopPropagation();
});

/* interfaceDocument.getElementById('shader-input').addEventListener('mousedown', e => {
  e.stopPropagation();
});
const shaderInputV = interfaceDocument.getElementById('shader-input-v');
shaderInputV.value = objectMaterial.program.vertexShader.source;
shaderInputV.addEventListener('keydown', e => {
  e.stopPropagation();
});
shaderInputV.addEventListener('input', e => {
  bindObjectShader(objectMeshes, shaderInputV.value, shaderInputF.value);
});
const shaderInputF = interfaceDocument.getElementById('shader-input-f');
shaderInputF.value = objectMaterial.program.fragmentShader.source;
shaderInputF.addEventListener('keydown', e => {
  e.stopPropagation();
});
shaderInputF.addEventListener('input', e => {
  bindObjectShader(objectMeshes, shaderInputV.value, shaderInputF.value);
}); */

const objectNameEl = interfaceDocument.getElementById('object-name');
objectNameEl.addEventListener('keydown', e => {
  e.stopPropagation();
});
interfaceDocument.getElementById('ops-form').addEventListener('submit', async e => {
  e.preventDefault();
  e.stopPropagation();

  await _commitMiningMeshes();
  _centerObjectMeshes();
  const [
    dataArrayBuffer,
    screenshotBlob,
  ] = await Promise.all([
    saveObjectMeshes(objectMeshes, scriptInputTextarea.value/*, shaderInputV.value, shaderInputF.value*/),
    _screenshotMiningMeshes(),
  ]);

  const [
    dataHash,
    screenshotHash,
  ] = await Promise.all([
    fetch(`${apiHost}/data/`, {
      method: 'PUT',
      body: dataArrayBuffer,
    })
      .then(res => res.json())
      .then(j => j.hash),
    fetch(`${apiHost}/data/`, {
      method: 'PUT',
      body: screenshotBlob,
    })
      .then(res => res.json())
      .then(j => j.hash),
  ]);
  const metadataHash = await fetch(`${apiHost}/metadata/`, {
      method: 'PUT',
      body: JSON.stringify({
        objectName: objectNameEl.value,
        dataHash,
        screenshotHash,
      }),
    })
      .then(res => res.json())
      .then(j => j.hash);

  const p = makePromise();
  const instance = await contract.getInstance();
  const size = pointerMesh.getSize();
  instance.mint([size[3] - size[0], size[4] - size[1], size[5] - size[2]], 'hash', metadataHash, (err, value) => {
    if (!err) {
      p.accept(value);
    } else {
      p.reject(err);
    }
  });
  await p;
});
interfaceDocument.getElementById('new-op').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  objectNameEl.value = '';
  _newMiningMeshes();
  _setHoveredObjectMesh(null);
  _setSelectedObjectMesh(null);
  for (let i = 0; i < objectMeshes.length; i++) {
    const objectMesh = objectMeshes[i];
    container.remove(objectMesh);
    objectMesh.destroy();
  }
  objectMeshes.length = 0;
});
_bindUploadFileButton(interfaceDocument.getElementById('load-op-input'), file => {
  const r = new FileReader();
  r.onload = async () => {
    const arrayBuffer = r.result;
    for (let i = 0; i < objectMeshes.length; i++) {
      const objectMesh = objectMeshes[i];
      container.remove(objectMesh);
      objectMesh.destroy();
    }
    objectMeshes.length = 0;
    const {objectMeshes: newObjectMeshes, script/*, shader: {vertex, fragment}*/} = await loadObjectMeshes(arrayBuffer);
    objectMeshes.length = newObjectMeshes.length;
    for (let i = 0; i < newObjectMeshes.length; i++) {
      const newObjectMesh = newObjectMeshes[i];
      objectMeshes[i] = newObjectMesh;
      container.add(newObjectMesh);
    }
    if (script) {
      scriptInputTextarea.value = script;
      if (scriptsBound) {
        bindObjectScript(objectState, script, objectMeshes);
      }
    }
    /* if (vertex) {
      shaderInputV.value = vertex;
    }
    if (fragment) {
      shaderInputF.value = fragment;
    }
    if (vertex || fragment) {
      bindObjectShader(objectMeshes, vertex, fragment);
    } */
  };
  r.readAsArrayBuffer(file);
});
interfaceDocument.getElementById('save-op').addEventListener('click', async e => {
  const arrayBuffer = await saveObjectMeshes(objectMeshes, scriptInputTextarea.value/*, shaderInputV.value, shaderInputF.value*/);
  const blob = new Blob([arrayBuffer], {
    type: 'model/gltf.binary',
  });
  downloadFile(blob, 'object.glb');
});

const colors = interfaceDocument.querySelectorAll('.color');
Array.from(colors).forEach(color => {
  const inner = color.querySelector('.inner');
  color.addEventListener('mousedown', e => {
    e.stopPropagation();
  });
  color.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    
    Array.from(colors).forEach(color => {
      color.classList.remove('selected');
    });
    currentColor = new THREE.Color().setStyle(inner.style.backgroundColor);
    pointerMesh.material.uniforms.uBrushColor.value.set(currentColor.r, currentColor.g, currentColor.b);
    color.classList.add('selected');
    
    uiMesh.update();
  });
});
let currentColor = new THREE.Color().setStyle(colors[0].querySelector('.inner').style.backgroundColor);
colors[0].classList.add('selected');
pointerMesh.material.uniforms.uBrushColor.value.set(currentColor.r, currentColor.g, currentColor.b);

const brushSizeEl = interfaceDocument.getElementById('brush-size');
let brushSize = brushSizeEl.value;
brushSizeEl.addEventListener('mousedown', e => {
  e.stopPropagation();
});
brushSizeEl.addEventListener('input', e => {
  brushSize = e.target.value;
  interfaceDocument.getElementById('brush-size-text').innerHTML = brushSize;
});

const worldScaleEl = interfaceDocument.getElementById('world-scale');
worldScaleEl.addEventListener('mousedown', e => {
  e.stopPropagation();
});
let worldScale = worldScaleEl.value;
worldScaleEl.addEventListener('input', e => {
  worldScale = e.target.value;

  const cameraPosition = camera.position.clone()
    .add(new THREE.Vector3(0, 0, -1.5).applyQuaternion(camera.quaternion));
  container.matrix
    .premultiply(new THREE.Matrix4().makeTranslation(-cameraPosition.x, -cameraPosition.y, -cameraPosition.z))
    .premultiply(new THREE.Matrix4().makeScale(worldScale/container.scale.x, worldScale/container.scale.y, worldScale/container.scale.z))
    .premultiply(new THREE.Matrix4().makeTranslation(cameraPosition.x, cameraPosition.y, cameraPosition.z))
    .decompose(container.position, container.quaternion, container.scale);

  interfaceDocument.getElementById('world-scale-text').innerHTML = worldScale;
});

let scriptsBound = false;
interfaceDocument.getElementById('enable-scripts-button').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  scriptsBound = !scriptsBound;
  if (scriptsBound) {
    bindObjectScript(objectState, scriptInputTextarea.value, objectMeshes);

    for (let i = 0; i < objectMeshes.length; i++) {
      const objectMesh = objectMeshes[i];
      objectMesh.originalPosition = objectMesh.position.clone();
      objectMesh.originalQuaternion = objectMesh.quaternion.clone();
      objectMesh.originalScale = objectMesh.scale.clone();
    }
  } else {
    bindObjectScript(objectState, null, null);

    for (let i = 0; i < objectMeshes.length; i++) {
      const objectMesh = objectMeshes[i];
      objectMesh.position.copy(objectMesh.originalPosition);
      objectMesh.quaternion.copy(objectMesh.originalQuaternion);
      objectMesh.scale.copy(objectMesh.originalScale);
      objectMesh.originalPosition = null;
      objectMesh.originalQuaternion = null;
      objectMesh.originalScale = null;
    }
  }
});

let physicsBound = false;
interfaceDocument.getElementById('enable-physics-button').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  physicsBound = !physicsBound;
  if (physicsBound) {
    _bindObjectMeshPhysics();
  } else {
    _unbindObjectMeshPhysics();
  }
});

// multiplayer

initLocalRig(container);

let channelConnection = null;
const peerConnections = [];
const _connectMultiplayer = async rid => {
  const roomId = rid || makeId();

  channelConnection = new XRChannelConnection(roomId);
  channelConnection.addEventListener('peerconnection', e => {
    const peerConnection = e.detail;

    bindPeerConnection(peerConnection, container);

    peerConnection.addEventListener('open', () => {
      peerConnections.push(peerConnection);
      document.getElementById('user-count-text').innerText = peerConnections.length + 1;
    });
    peerConnection.addEventListener('close', () => {
      peerConnections.splice(peerConnections.indexOf(peerConnection), 1);
      document.getElementById('user-count-text').innerText = peerConnections.length + 1;
    });
  });

  document.getElementById('room-code-text').innerText = roomId;
  const href = `${window.location.protocol}//${window.location.host}${window.location.pathname}?r=${roomId}`;
  document.getElementById('room-link').href = href;

  history.replaceState(null, '', href);
};
const _disconnectMultiplayer = async () => {
  if (channelConnection) {
    channelConnection.disconnect()
    channelConnection = null;

    const href = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    history.replaceState(null, '', href);
  }
};
window.addEventListener('beforeunload', _disconnectMultiplayer);

const header = document.getElementById('header');
const _clearMultiplayerClasses = () => {
  ['connected', 'dialog'].forEach(c => {
    header.classList.remove(c);
  });
};
document.getElementById('create-room-button').addEventListener('click', async e => {
  await _connectMultiplayer();

  _clearMultiplayerClasses();
  header.classList.add('connected');
});
document.getElementById('use-code-button').addEventListener('click', e => {
  _clearMultiplayerClasses();
  header.classList.add('dialog');
  document.getElementById('room-code-input').value = '';
});
document.getElementById('connect-button').addEventListener('click', async e => {
  await _connectMultiplayer(document.getElementById('room-code-input').value);

  _clearMultiplayerClasses();
  header.classList.add('connected');
});
document.getElementById('cancel-button').addEventListener('click', e => {
  _clearMultiplayerClasses();
});
document.getElementById('disconnect-button').addEventListener('click', async e => {
  await _disconnectMultiplayer();

  _clearMultiplayerClasses();
});

// xr

const rayMesh = (() => {
  const geometry = new THREE.CylinderBufferGeometry(0.002, 0.002, 1, 3, 1, false, 0, Math.PI*2)
    .applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1/2, 0))
    .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/2)));
  const material = new THREE.MeshBasicMaterial({
    color: 0x42a5f5,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  mesh.frustumCulled = false;
  return mesh;
})();
scene.add(rayMesh);

const enterXrButton = interfaceDocument.getElementById('enter-xr-button');
let currentSession = null;
const triggerDowns = [false, false];
const gripDowns = [false, false];
let scaleState = null;
function onSessionStarted(session) {
  session.addEventListener('end', onSessionEnded);

  renderer.xr.setSession(session);

  currentSession = session;

  const controllerModelFactory = new XRControllerModelFactory();
  for (let i = 0; i < 2; i++) {
    const controller = renderer.xr.getController(i);
    controller.addEventListener('connected', e => {
      controller.userData.data = e.data;
    });
    controller.addEventListener('selectstart', e => {
      if (controller.userData.data && controller.userData.data.handedness === 'right') {
        _beginTool(true, false);
      }
      triggerDowns[i] = true;
    });
    controller.addEventListener('selectend', e => {
      if (controller.userData.data && controller.userData.data.handedness === 'right') {
        _endTool(true, false);
      }
      triggerDowns[i] = false;
    });
    
    const controllerGrip = renderer.xr.getControllerGrip(i);
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
    controllerGrip.addEventListener('selectstart', e => {
      if (controller.userData.data && controller.userData.data.handedness === 'right') {
        _beginTool(false, true);
      }
      const oldGripDownsAll = gripDowns.every(gripDown => gripDown);
      gripDowns[i] = true;
      const newGripDownsAll = gripDowns.every(gripDown => gripDown);
      if (newGripDownsAll && oldGripDownsAll) {
        scaleState = {
          startPosition: renderer.xr.getControllerGrip(0).position.clone()
            .add(renderer.xr.getControllerGrip(1).position),
          startQuaternion: new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(1, 0, 0),
            renderer.xr.getControllerGrip(0).position.clone()
              .sub(renderer.xr.getControllerGrip(1).position)
              .normalize()
          ),
          startWorldWidth: renderer.xr.getControllerGrip(0).position
            .distanceTo(renderer.xr.getControllerGrip(1).position),
          startScale: 1,
        };
      }
    });
    controllerGrip.addEventListener('selectend', e => {
      if (controller.userData.data && controller.userData.data.handedness === 'right') {
        _endTool(false, true);
      }
      gripDowns[i] = false;
      const newGripDownsAll = gripDowns.every(gripDown => gripDown);
      if (!newGripDownsAll) {
        scaleState = null;
      }
    });
    scene.add(controllerGrip);
  }
}
function onSessionEnded() {
  currentSession.removeEventListener('end', onSessionEnded);

  currentSession = null;
}
enterXrButton.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  
  if (currentSession === null) {
    // WebXR's requestReferenceSpace only works if the corresponding feature
    // was requested at session creation time. For simplicity, just ask for
    // the interesting ones as optional features, but be aware that the
    // requestReferenceSpace call will fail if it turns out to be unavailable.
    // ('local' is always available for immersive sessions and doesn't need to
    // be requested separately.)
    var sessionInit = {
      optionalFeatures: [
        'local-floor',
        'bounded-floor',
      ],
    };
    navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
  } else {
    currentSession.end();
  }
});

const uiRenderer = (() => {
  const loadPromise = Promise.all([
    new Promise((accept, reject) => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://render.exokit.xyz/';
      iframe.onload = () => {
        accept(iframe);
      };
      iframe.onerror = err => {
        reject(err);
      };
      iframe.setAttribute('frameborder', 0);
      iframe.style.position = 'absolute';
      iframe.style.width = `${uiSize}px`;
      iframe.style.height = `${uiSize}px`;
      iframe.style.top = '-4096px';
      iframe.style.left = '-4096px';
      document.body.appendChild(iframe);
    }),
    fetch('interface-create.html')
      .then(res => res.text()),
  ]);

  let renderIds = 0;
  return {
    async render(searchResults, inventory, channels, selectedTab, rtcConnected, landConnected) {
      const [iframe, interfaceHtml] = await loadPromise;

      if (renderIds > 0) {
        iframe.contentWindow.postMessage({
          method: 'cancel',
          id: renderIds,
        });
      }

      const start = Date.now();
      const mc = new MessageChannel();
      const templateData = {
        width: uiSize,
        height: uiSize,
        zoom: 5,
        hideOps: true,
      };
      for (let i = 0; i < tools.length; i++) {
        templateData[`tool${i+1}Selected`] = selectedTool === tools[i].getAttribute('tool');
      }
      const currentColorString = currentColor.getHexString();
      for (let i = 0; i < colors.length; i++) {
        const colorString = new THREE.Color(colors[i].querySelector('.inner').style.backgroundColor).getHexString();
        templateData[`color${i+1}Selected`] = currentColorString === colorString;
      }
      iframe.contentWindow.postMessage({
        method: 'render',
        id: ++renderIds,
        htmlString: interfaceHtml,
        templateData,
        width: uiSize,
        height: uiSize,
        port: mc.port2,
      }, '*', [mc.port2]);
      const result = await new Promise((accept, reject) => {
        mc.port1.onmessage = e => {
          const {data} = e;
          const {error, result} = data;

          if (result) {
            console.log('time taken', Date.now() - start);

            accept(result);
          } else {
            reject(error);
          }
        };
      });
      return result;
    },
  };
})();
const uiMesh = (() => {
  const geometry = new THREE.PlaneBufferGeometry(0.2, 0.2)
    .applyMatrix4(new THREE.Matrix4().makeTranslation(0, uiWorldSize/2, 0));
  const canvas = document.createElement('canvas');
  canvas.width = uiSize;
  canvas.height = uiSize;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(uiSize, uiSize);
  const texture = new THREE.Texture(
    canvas,
    THREE.UVMapping,
    THREE.ClampToEdgeWrapping,
    THREE.ClampToEdgeWrapping,
    THREE.LinearFilter,
    THREE.LinearMipMapLinearFilter,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
    16,
    THREE.LinearEncoding
  );
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  mesh.frustumCulled = false;
  
  const highlightMesh = (() => {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 0.01);
    const material = new THREE.MeshBasicMaterial({
      color: 0x42a5f5,
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    return mesh;
  })();
  /* highlightMesh.position.x = -uiWorldSize/2 + (10 + 150/2)/uiSize*uiWorldSize;
  highlightMesh.position.y = uiWorldSize - (60 + 150/2)/uiSize*uiWorldSize;
  highlightMesh.scale.x = highlightMesh.scale.y = 150/uiSize*uiWorldSize; */
  mesh.add(highlightMesh);

  let anchors = [];
  mesh.update = () => {
    uiRenderer.render()
      .then(result => {
        imageData.data.set(result.data);
        ctx.putImageData(imageData, 0, 0);
        texture.needsUpdate = true;
        mesh.visible = true;
        
        anchors = result.anchors;
        // console.log(anchors);
      });
  };
  let hoveredAnchor = null;
  mesh.intersect = uv => {
    hoveredAnchor = null;
    highlightMesh.visible = false;

    if (uv) {
      uv.y = 1 - uv.y;
      uv.multiplyScalar(uiSize);

      for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        const {top, bottom, left, right, width, height} = anchor;
        // console.log('check', {x: uv.x, y: uv.y, top, bottom, left, right});
        if (uv.x >= left && uv.x < right && uv.y >= top && uv.y < bottom) {
          hoveredAnchor = anchor;
          
          highlightMesh.position.x = -uiWorldSize/2 + (left + width/2)/uiSize*uiWorldSize;
          highlightMesh.position.y = uiWorldSize - (top + height/2)/uiSize*uiWorldSize;
          highlightMesh.scale.x = width/uiSize*uiWorldSize;
          highlightMesh.scale.y = height/uiSize*uiWorldSize;
          highlightMesh.visible = true;
          break;
        }
      }
    }
  };
  mesh.click = () => {
    if (hoveredAnchor) {
      const {id} = hoveredAnchor;
      if (/^(?:tool-|color-)/.test(id)) {
        interfaceDocument.getElementById(id).click();
      } else {
        switch (id) {
          default: {
            console.warn('unknown anchor click', id);
            break;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  };
  mesh.update();

  return mesh;
})();
uiMesh.position.set(0.5, 0.5, 1);
scene.add(uiMesh);

function animate() {
  orbitControls.update();
  
  if (currentSession) {
    for (let i = 0; i < 2; i++) {
      const controller = renderer.xr.getController(i);
      if (controller.userData.data) {
        if (controller.userData.data.handedness === 'left') {
          uiMesh.position.copy(controller.position);
          uiMesh.quaternion.copy(controller.quaternion);
        } else if (controller.userData.data.handedness === 'right') {
          _updateRaycasterFromObject(localRaycaster, controller);
          _updateTool(localRaycaster);
        }
      }
    }

    _updateControllers();
  } else {
    updatePlayerCamera(camera);
  }

  for (let i = 0; i < peerConnections.length; i++) {
    const peerConnection = peerConnections[i];
    peerConnection.rig && peerConnection.rig.update();
  }

  tickObjectScript(objectState);

  if (ammo) {
    ammo.simulate();
    for (let i = 0; i < objectMeshes.length; i++) {
      ammo.updateObjectMesh(objectMeshes[i]);
    }
  }

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

(async () => {
  const q = parseQuery(window.location.search);
  const {r, o} = q;
  if (r) {
    document.getElementById('room-code-input').value = r;
    document.getElementById('connect-button').click();
  } else if (o) {
    const metadata = await fetch(`${apiHost}/metadata${o}`)
      .then(res => res.json());
    const {objectName, dataHash} = metadata;
    objectNameEl.value = objectName;
    const arrayBuffer = await fetch(`${apiHost}/data${dataHash}`)
      .then(res => res.arrayBuffer());
    for (let i = 0; i < objectMeshes.length; i++) {
      const objectMesh = objectMeshes[i];
      container.remove(objectMesh);
      objectMesh.destroy();
    }
    objectMeshes.length = 0;
    const {objectMeshes: newObjectMeshes, script/*, shader: {vertex, fragment}*/} = await loadObjectMeshes(arrayBuffer);
    objectMeshes.length = newObjectMeshes.length;
    for (let i = 0; i < newObjectMeshes.length; i++) {
      const newObjectMesh = newObjectMeshes[i];
      objectMeshes[i] = newObjectMesh;
      container.add(newObjectMesh);
    }
    if (script) {
      scriptInputTextarea.value = script;
      if (scriptsBound) {
        bindObjectScript(objectState, script, objectMeshes);
      }
    }
    /* if (vertex) {
      shaderInputV.value = vertex;
    }
    if (fragment) {
      shaderInputF.value = fragment;
    }
    if (vertex || fragment) {
      bindObjectShader(objectMeshes, vertex, fragment);
    } */
  }
})();

navigator.xr && navigator.xr.isSessionSupported('immersive-vr').then(supported => {
  if (supported) {
    renderer.xr.enabled = true;
    enterXrButton.classList.remove('disabled');
  } else {
    // nothing
  }
});

};

const interfaceIframe = document.getElementById('interface-iframe');
const interfaceWindow = interfaceIframe.contentWindow;
const interfaceDocument = interfaceIframe.contentDocument;
if (interfaceDocument.readyState === 'complete') {
  _load();
} else {
  interfaceDocument.addEventListener('readystatechange', () => {
    if (interfaceDocument.readyState === 'complete') {
      _load();
    }
  });
}