import * as THREE from './three.module.js';
window.THREE = THREE;
import {OrbitControls} from './OrbitControls.js';
import {TransformControls} from './TransformControls.js';
/* import {BufferGeometryUtils} from './BufferGeometryUtils.js';
import {OutlineEffect} from './OutlineEffect.js'; */
import {GLTFLoader} from './GLTFLoader.js';
/* import {GLTFExporter} from './GLTFExporter.js';
import {XRControllerModelFactory} from './XRControllerModelFactory.js';
import {Ammo as AmmoLib} from './ammo.wasm.js'; */
import {apiHost} from './config.js';
import {makePromise} from './util.js';
import contract from './contract.js';
import {loadObjectMeshes} from './object.js';
import {makeObjectState, bindObjectScript, tickObjectScript/*, bindObjectShader*/} from './runtime.js';

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
function mod(a, n) {
  return ((a%n)+n)%n;
}

const PARCEL_SIZE = 10;
const size = PARCEL_SIZE + 1;
const uiSize = 2048;
const uiWorldSize = 0.2;
const floorSize = 100;

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
camera.position.set(0, 0.5, 1);
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

const orbitControls = new OrbitControls(camera, interfaceDocument.querySelector('.background'), interfaceDocument);
orbitControls.target.copy(camera.position).add(new THREE.Vector3(0, 0, -1));
orbitControls.screenSpacePanning = true;
// orbitControls.enabled = !!loginToken;
orbitControls.enableMiddleZoom = false;
orbitControls.update();

const parcelGeometry = (() => {
  const tileGeometry = new THREE.PlaneBufferGeometry(1, 1)
    .applyMatrix4(new THREE.Matrix4().makeScale(0.95, 0.95, 1))
    .applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/2)))
    .applyMatrix4(new THREE.Matrix4().makeTranslation(0.5, 0, 0.5))
    .toNonIndexed();
  const numCoords = tileGeometry.attributes.position.array.length;
  const numVerts = numCoords/3;
  const positions = new Float32Array(numCoords*floorSize*floorSize);
  const colors = new Float32Array(numCoords*floorSize*floorSize);
  const centers = new Float32Array(numCoords*floorSize*floorSize);
  /* const typesx = new Float32Array(numVerts*floorSize*floorSize);
  const typesz = new Float32Array(numVerts*floorSize*floorSize); */
  let i = 0;
  for (let x = -floorSize/2; x < floorSize/2; x++) {
    for (let z = -floorSize/2; z < floorSize/2; z++) {
      const newTileGeometry = tileGeometry.clone()
        .applyMatrix4(new THREE.Matrix4().makeTranslation(x, 0, z));
      positions.set(newTileGeometry.attributes.position.array, i * newTileGeometry.attributes.position.array.length);
      for (let j = 0; j < newTileGeometry.attributes.position.array.length/3; j++) {
        new THREE.Vector3(x, 0, z).toArray(centers, i*newTileGeometry.attributes.position.array.length + j*3);
      }
      /* let typex = 0;
      if (mod((x + floorSize/2), floorSize) === 0) {
        typex = 1/8;
      } else if (mod((x + floorSize/2), floorSize) === floorSize-1) {
        typex = 2/8;
      }
      let typez = 0;
      if (mod((z + floorSize/2), floorSize) === 0) {
        typez = 1/8;
      } else if (mod((z + floorSize/2), floorSize) === floorSize-1) {
        typez = 2/8;
      }
      for (let j = 0; j < numVerts; j++) {
        typesx[i*numVerts + j] = typex;
        typesz[i*numVerts + j] = typez;
      } */
      i++;
    }
  }
  // colors.fill(1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('center', new THREE.BufferAttribute(centers, 3));
  /* geometry.setAttribute('typex', new THREE.BufferAttribute(typesx, 1));
  geometry.setAttribute('typez', new THREE.BufferAttribute(typesz, 1)); */
  return geometry;
})();
const floorVsh = `
  #define PI 3.1415926535897932384626433832795

  uniform vec3 uPosition;
  uniform float uAnimation;
  uniform vec4 uSelectedParcel;
  attribute vec3 color;
  attribute vec3 center;
  attribute float typex;
  attribute float typez;
  varying vec3 vPosition;
  varying vec3 vColor;
  varying float vTypex;
  varying float vTypez;
  varying float vDepth;
  varying float vPulse;

  float range = 1.0;

  void main() {
    float height;
    vec3 c = center + uPosition;
    float selectedWidth = uSelectedParcel.z - uSelectedParcel.x;
    float selectedHeight = uSelectedParcel.w - uSelectedParcel.y;
    vPulse = 1.0 + (1.0 - mod(uAnimation * 2.0, 1.0)/2.0) * 0.2;
    // vPulse = 0.0;
    vec3 p = vec3(position.x, position.y + height, position.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    vPosition = position;
    vTypex = typex;
    vTypez = typez;
    vDepth = gl_Position.z / 30.0;
    vColor = color;
  }
`;
const floorFsh = `
  #define PI 3.1415926535897932384626433832795

  uniform vec3 uColor;
  uniform float uHover;
  uniform float uAnimation;
  varying vec3 vPosition;
  varying vec3 vColor;
  varying float vTypex;
  varying float vTypez;
  varying float vDepth;
  varying float vPulse;

  void main() {
    // float add = uHover * 0.2;
    vec3 f = fract(vPosition);
    vec3 c = vColor * vPulse;
    float a = (1.0-vDepth)*0.8;
    gl_FragColor = vec4(c, a);
  }
`;
const _makeFloorMesh = (x, z) => {
  const geometry = parcelGeometry;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uPosition: {
        type: 'v3',
        value: new THREE.Vector3(),
      },
      uColor: {
        type: 'c',
        value: new THREE.Color(0xAAAAAA),
      },
      uHover: {
        type: 'f',
        value: 0,
      },
      uSelectedParcel: {
        type: 'v4',
        value: new THREE.Vector4(),
      },
      uAnimation: {
        type: 'f',
        value: 1,
      },
    },
    vertexShader: floorVsh,
    fragmentShader: floorFsh,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.position.set(x*floorSize, 0, z*floorSize);
  mesh.material.uniforms.uPosition.value.copy(mesh.position);
  mesh.frustumCulled = false;
  /* mesh.update = () => {
    const xrSite = _getFloorMeshXrSite(mesh);
    const color = _getSelectedColor(xrSite);
    material.uniforms.uColor.value.setHex(color);
  }; */
  const floorPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0));
  const intersectHighlightColor = new THREE.Color(0x42a5f5);
  const intersection = [NaN, NaN, NaN, NaN];
  mesh.getIntersection = () => !isNaN(intersection[0]) ? intersection : null;
  mesh.intersect = (raycaster, size) => {
    for (let i = 0; i < 4; i++) {
      intersection[i] = NaN;
    }

    const intersectionResult = new THREE.Vector3();
    if (raycaster && raycaster.ray.intersectPlane(floorPlane, intersectionResult)) {
      intersection[0] = Math.floor(intersectionResult.x);
      intersection[1] = Math.floor(intersectionResult.z);
      intersection[2] = intersection[0] + size[0];
      intersection[3] = intersection[1] + size[2];
    }
  };
  let highlights = {};
  mesh.setHighlight = (x1, z1, x2, z2, c) => {
    for (let z = z1; z < z2; z++) {
      for (let x = x1; x < x2; x++) {
        highlights[[x, z].join(',')] = c;
      }
    }
  };
  mesh.clearHighlights = () => {
    highlights = {};
  };
  mesh.refresh = () => {
    geometry.attributes.color.array.fill(0);

    const _highlight = (x, z, c) => {
      x += floorSize/2;
      z += floorSize/2;
      const startIndex = (floorSize*x + z)*3*2;
      if (startIndex*3 >= 0 && startIndex*3 < geometry.attributes.color.array.length) {
        for (let i = 0; i < 3*2; i++) {
          geometry.attributes.color.array[startIndex*3 + i*3] += c.r;
          geometry.attributes.color.array[startIndex*3 + i*3 + 1] += c.g;
          geometry.attributes.color.array[startIndex*3 + i*3 + 2] += c.b;
        }
      }
    };

    if (!isNaN(intersection[0])) {
      for (let x = intersection[0]; x < intersection[2]; x++) {
        for (let z = intersection[1]; z < intersection[3]; z++) {
          _highlight(x, z, intersectHighlightColor);
        }
      }
    }
    for (const k in highlights) {
      const match = k.match(/^(-?[0-9]+),(-?[0-9]+)$/);
      if (match) {
        const x = parseInt(match[1], 10);
        const z = parseInt(match[2], 10);
        const c = highlights[k];
        _highlight(x, z, c);
      }
    }

    geometry.attributes.color.needsUpdate = true;
  };
  return mesh;
};
const floorMeshes = [_makeFloorMesh(0, 0)];
floorMeshes.forEach(floorMesh => {
  scene.add(floorMesh);
});

let dragData = null;
[
  'inventory-op',
  'inventory-close-button',
].forEach(k => {
  interfaceDocument.getElementById(k).addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    interfaceDocument.getElementById('inventory').classList.toggle('open');
  });
});

const background = interfaceDocument.querySelector('.background');
background.addEventListener('dragenter', e => {
  e.preventDefault();
});
background.addEventListener('dragover', e => {
  e.preventDefault();

  _updateRaycasterFromMouseEvent(localRaycaster, e);
  floorMeshes[0].intersect(localRaycaster, dragData.size);
  floorMeshes[0].refresh();
});
background.addEventListener('drop', async e => {
  e.preventDefault();

  const intersection = floorMeshes[0].getIntersection();
  if (intersection) {
    console.log('drop to', dragData.id, [intersection[0], 0, intersection[1]], dragData.size);

    const instance = await contract.getInstance();
    const p = makePromise();
    instance.bindToGrid(dragData.id, [intersection[0], 0, intersection[1]], err => {
      if (!err) {
        p.accept();
      } else {
        p.reject(err);
      }
    });
    floorMeshes[0].intersect(null);
    floorMeshes[0].refresh();
    await p;
  }
});
background.addEventListener('wheel', e => {
  e.preventDefault();
});

const localRaycaster = new THREE.Raycaster();
const _updateRaycasterFromMouseEvent = (raycaster, e) => {
  const mouse = new THREE.Vector2(( ( e.clientX ) / window.innerWidth ) * 2 - 1, - ( ( e.clientY ) / window.innerHeight ) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
};

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
        _beginTool();
      }
    });
    controller.addEventListener('selectend', e => {
      if (controller.userData.data && controller.userData.data.handedness === 'right') {
        _endTool();
      }
    });
    
    const controllerGrip = renderer.xr.getControllerGrip(i);
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
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
    fetch('interface-world.html')
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
      };
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
uiMesh.position.set(0, 0.5, 0);
scene.add(uiMesh);

contract.init();

const inventoryItemsEl = interfaceDocument.getElementById('inventory-items');
(async () => {
  const instance = await contract.getInstance();
  const noncePromise = makePromise();
  instance.getNonce((err, nonce) => {
    if (!err) {
      noncePromise.accept(nonce);
    } else {
      noncePromise.reject(err);
    }
  });
  let nonce = await noncePromise;
  nonce = nonce.toNumber();

  console.log('got nonce', nonce);

  for (let i = 1; i <= nonce; i++) {
    const [
      metadataHash,
      size,
    ] = await Promise.all([
      (() => {
        const p = makePromise();
        instance.getMetadata(i, 'hash', (err, metadataHash) => {
          if (!err) {
            p.accept(metadataHash);
          } else {
            p.reject(err);
          }
        });
        return p;
      })(),
      (() => {
        const p = makePromise();
        instance.getSize(i, (err, size) => {
          if (!err) {
            size = size.map(n => n.toNumber());
            p.accept(size);
          } else {
            p.reject(err);
          }
        });
        return p;
      })(),
    ]);
    const metadata = await fetch(`${apiHost}/metadata${metadataHash}`)
      .then(res => res.json());
    const {dataHash, screenshotHash} = metadata;
    const a = document.createElement('a');
    // a.href = `/create.html?o=${encodeURIComponent(metadataHash)}`;
    a.classList.add('item');
    a.setAttribute('draggable', true);
    a.innerHTML = `\
      <img src="${apiHost}/data${screenshotHash}" width=80 height=80>
      <div class=wrap>
        <div class=name>${metadata.objectName}</div>
        <div class=details>${size.join('x')}</div>
      </div>
    `;
    a.addEventListener('dragstart', e => {
      dragData = {
        // type: 'object',
        id: i,
        hash: metadataHash,
        size,
      };
      // e.dataTransfer.setData('text', dragData);
    });
    a.addEventListener('dragend', e => {
      dragData = null;
    });
    inventoryItemsEl.appendChild(a);
  }
})();

const objectMeshes = [];
const objectStates = [];
(async () => {
  const instance = await contract.getInstance();
  const idsPromise = makePromise();
  instance.getGridTokenIds([-5, 0, -5], [10, 10, 10], (err, ids) => {
    if (!err) {
      ids = ids.map(i => i.toNumber());
      idsPromise.accept(ids);
    } else {
      idsPromise.reject(err);
    }
  });
  const ids = await idsPromise;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const [
      metadataHash,
      loc,
      size,
    ] = await Promise.all([
      (() => {
        const metadataHashPromise = makePromise();
        instance.getMetadata(id, 'hash', (err, metadataHash) => {
          if (!err) {
            metadataHashPromise.accept(metadataHash);
          } else {
            metadataHashPromise.reject(err);
          }
        });
        return metadataHashPromise;
      })(),
      (() => {
        const locationPromise = makePromise();
        instance.getGridBinding(id, (err, loc) => {
          if (!err) {
            loc = new THREE.Vector3().fromArray(loc.map(l => l.toNumber()));
            locationPromise.accept(loc);
          } else {
            locationPromise.reject(err);
          }
        });
        return locationPromise;
      })(),
      (() => {
        const sizePromise = makePromise();
        instance.getSize(id, (err, size) => {
          if (!err) {
            size = new THREE.Vector3().fromArray(size.map(l => l.toNumber()));
            sizePromise.accept(size);
          } else {
            sizePromise.reject(err);
          }
        });
        return sizePromise;
      })(),
    ]);

    const metadata = await fetch(`${apiHost}/metadata${metadataHash}`)
      .then(res => res.json());
    const {dataHash} = metadata;

    const {objectMeshes: newObjectMeshes, script/*, shader: {vertex, fragment}*/} = await loadObjectMeshes(`${apiHost}/data${dataHash}`);
    for (let i = 0; i < newObjectMeshes.length; i++) {
      const newObjectMesh = newObjectMeshes[i];
      newObjectMesh.position.add(loc);
      scene.add(newObjectMesh);
      objectMeshes.push(newObjectMesh);
    }
    if (script) {
      const objectState = makeObjectState();
      bindObjectScript(objectState, script, newObjectMeshes);
      objectStates.push(objectState);
    }
    /* if (vertex || fragment) {
      bindObjectShader(newObjectMeshes, vertex, fragment);
    } */

    floorMeshes[0].setHighlight(loc.x, loc.z, loc.x + size.x, loc.z + size.z, new THREE.Color(0x66bb6a));
  }
  floorMeshes[0].refresh();
})();

function animate() {
  orbitControls.update();
  renderer.render(scene, camera);
  
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
  }

  const now = Date.now();
  for (let i = 0; i < floorMeshes.length; i++) {
    floorMeshes[i].material.uniforms.uAnimation.value = (now%2000)/2000;
  }

  for (let i = 0; i < objectStates.length; i++) {
    tickObjectScript(objectStates[i]);
  }

  /* if (ammo) {
    ammo.simulate();
    for (let i = 0; i < objectMeshes.length; i++) {
      ammo.updateObjectMesh(objectMeshes[i]);
    }
  } */
}
renderer.setAnimationLoop(animate);

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