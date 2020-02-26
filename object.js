import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {GLTFExporter} from './GLTFExporter.js';
import {makePromise} from './util.js';

export const objectMaterial = (() => {
  /* const terrainVsh = `
    attribute vec3 color;
    varying vec3 vColor;
    varying vec3 vViewPosition;
    void main() {
      vec4 mvPosition = modelMatrix * vec4( position.xyz, 1.0 );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );
      vColor = color;
      vViewPosition = mvPosition.xyz;
    }
  `;
  const terrainFsh = `
    varying vec3 vColor;
    uniform vec3 uSelect;
    varying vec3 vViewPosition;
    // vec4 color = vec4(${new THREE.Color(0x9ccc65).toArray().map(n => n.toFixed(8)).join(',')}, 1.0);
    // vec4 color2 = vec4(${new THREE.Color(0xec407a).toArray().map(n => n.toFixed(8)).join(',')}, 1.0);
    bool inRange(vec3 pos, vec3 minPos, vec3 maxPos) {
      return pos.x >= minPos.x &&
        pos.y >= minPos.y &&
        pos.z >= minPos.z &&
        pos.x <= maxPos.x &&
        pos.y <= maxPos.y &&
        pos.z <= maxPos.z;
    }
    void main() {
      // vec3 vColor = vec3(1.0, 0, 0);
      vec4 color = vec4(vColor, 1.0);
      vec3 fdx = vec3( dFdx( -vViewPosition.x ), dFdx( -vViewPosition.y ), dFdx( -vViewPosition.z ) );
      vec3 fdy = vec3( dFdy( -vViewPosition.x ), dFdy( -vViewPosition.y ), dFdy( -vViewPosition.z ) );
      vec3 normal = normalize( cross( fdx, fdy ) );
      float dotNL = saturate( dot( normal, normalize(vec3(1.0, 1.0, 1.0))) );

      float range = 1.01;
      // float range = 2.01;
      vec3 minPos = uSelect - range;
      vec3 maxPos = minPos + (range*2.);
      // if (inRange(vViewPosition, minPos, maxPos)) {
        // gl_FragColor = color2;
      // } else {
        gl_FragColor = color;
      // }
      // gl_FragColor.rgb += dotNL * 0.5;
    }
  `;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uSelect: {
        type: 'v3',
        value: new THREE.Vector3(NaN, NaN, NaN),
      },
    },
    vertexShader: terrainVsh,
    fragmentShader: terrainFsh,
    extensions: {
      derivatives: true,
    },
  }); */
  const material = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    vertexColors: THREE.VertexColors,
  });
  return material;
})();
export function makeObjectMeshFromGeometry(geometry, matrix) {
  const objectMesh = new THREE.Mesh(geometry, objectMaterial);
  if (matrix) {
    objectMesh.matrix.copy(matrix)
      .decompose(objectMesh.position, objectMesh.quaternion, objectMesh.scale);
  }
  objectMesh.frustumCulled = false;
  objectMesh.castShadow = true;
  objectMesh.worker = null;
  objectMesh.destroy = () => {
    if (objectMesh.worker) {
      objectMesh.worker.terminate();
      objectMesh.worker = null;
    }
  };
  return objectMesh;
};
export async function saveObjectMeshes(objectMeshes) {
  const exportScene = new THREE.Scene();
  exportScene.userData.gltfExtensions = {
    script: scriptInputTextarea.value,
    shader: {
      vertex: shaderInputV.value,
      fragment: shaderInputF.value,
    },
  };
  for (let i = 0; i < objectMeshes.length; i++) {
    exportScene.add(objectMeshes[i].clone());
  }

  const p = makePromise();
  const exporter = new GLTFExporter();
  exporter.parse(exportScene, gltf => {
    p.accept(gltf);
  }, {
    binary: true,
    includeCustomExtensions: true,
  });
  return await p;
};
export async function loadObjectMeshes(arrayBuffer) {
  const blob = new Blob([arrayBuffer], {
    type: 'model/gltf.binary',
  });
  const src = URL.createObjectURL(blob);

  const p = makePromise();
  const loader = new GLTFLoader();
  loader.load(src, p.accept, function onProgress() {}, p.reject);
  const o = await p;
  const {scene} = o;
  const {userData: {gltfExtensions}} = scene;
  if (gltfExtensions) {
    const {script, shader} = gltfExtensions;
    if (typeof script === 'string') {
      scriptInputTextarea.value = script;
      bindObjectScript(objectState, script, objectMeshes);
    }
    if (shader && typeof shader.vertex === 'string' && typeof shader.fragment === 'string') {
      shaderInputV.value = shader.vertex;
      shaderInputF.value = shader.fragment;
      _bindObjectShader(shader.vertex, shader.fragment);
    }
  }
  return scene.children.map(child => makeObjectMeshFromGeometry(child.geometry, child.matrix));
};