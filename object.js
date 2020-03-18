import * as THREE from './three.module.js';
import {GLTFLoader} from './GLTFLoader.js';
import {GLTFExporter} from './GLTFExporter.js';
import {makePromise} from './util.js';

/* function CheckerBoardTexture(color1, color2, rows, cols) {
  color1 = color1 || new THREE.Color(0xafafaf);
  color2 = color2 || new THREE.Color(0x3f3f3f);

  if(!(color1 instanceof THREE.Color)) color1 = new THREE.Color(color1);
  if(!(color2 instanceof THREE.Color)) color2 = new THREE.Color(color2);

  rows = rows || 4;
  cols = cols || 4;

  cols = Math.max(cols, 1);
  rows = Math.max(rows, 1);
  var size = 16;
  var pixelData = new Uint8Array( 3 * size );
  for (var i = 0, len = size; i < len; i++) {
    var i3 = i * 3;
    var color = (~~(i/2) % 2 == 0) ? color1 : color2;
    if(i >= 8) color = (color === color1) ? color2 : color1;
    pixelData[i3] = ~~(255 * color.r);
    pixelData[i3+1] = ~~(255 * color.g);
    pixelData[i3+2] = ~~(255 * color.b);
  };
  var width = 4,
    height = 4,
    format = THREE.RGBFormat,
    type = THREE.UnsignedByteType,
    mapping = undefined,
    wrapS = THREE.RepeatWrapping,
    wrapT = THREE.RepeatWrapping,
    magFilter = THREE.NearestFilter,
    minFilter = THREE.NearestFilter;

  THREE.DataTexture.call(this, pixelData, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter);
  this.repeat.set(rows * .5, cols * .5);
  this.needsUpdate = true;
}
CheckerBoardTexture.prototype = Object.create(THREE.DataTexture.prototype); */

// const png1x1WhiteBase64 = `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII=`;
export const objectImage = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(1, 1);
  imageData.data.set(Uint8Array.from([255, 255, 255, 255]));
  ctx.putImageData(imageData, 0, 0);
  return canvas;
})();
export const objectTexture = (() => {
  const texture = new THREE.Texture(
    objectImage,
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
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
})();
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
    // map: new CheckerBoardTexture(undefined, undefined, 64, 64),
    flatShading: true,
    map: objectTexture,
  });
  return material;
})();
export function makeObjectMeshFromGeometry(geometry, texture, matrix) {
  const material = objectMaterial.clone();
  if (texture) {
    material.map = texture;
  }
  const objectMesh = new THREE.Mesh(geometry, material);
  if (matrix) {
    objectMesh.matrix.copy(matrix)
      .decompose(objectMesh.position, objectMesh.quaternion, objectMesh.scale);
  }
  objectMesh.frustumCulled = false;
  objectMesh.castShadow = true;
  objectMesh.worker = null;
  objectMesh.destroy = () => {
    objectMesh.geometry.dispose();
    objectMesh.material.map.dispose();
    objectMesh.material.dispose();
    if (objectMesh.worker) {
      objectMesh.worker.terminate();
      objectMesh.worker = null;
    }
  };
  return objectMesh;
};
export async function saveObjectMeshes(objectMeshes, script/*, vertexShader, fragmentShader*/) {
  const exportScene = new THREE.Scene();
  exportScene.userData.gltfExtensions = {
    script: {
      source: script,
    },
    /* shader: {
      vertex: vertexShader,
      fragment: fragmentShader,
    }, */
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
export async function loadObjectMeshes(s) {
  const src = (() => {
    if (typeof s === 'string') {
      return s;
    } else if (s instanceof ArrayBuffer) {
      const blob = new Blob([s], {
        type: 'model/gltf.binary',
      });
      return URL.createObjectURL(blob);
    /* } else if (s.constructor.name === 'File') {
      return URL.createObjectURL(s); */
    } else {
      console.warn('cannot load object', s);
      throw new Error('cannot load object');
    }
  })();

  const p = makePromise();
  const loader = new GLTFLoader();
  loader.load(src, p.accept, function onProgress() {}, p.reject);
  const o = await p;
  const {scene} = o;
  const {userData: {gltfExtensions}} = scene;
  return {
    objectMeshes: scene.children.map(child => makeObjectMeshFromGeometry(child.geometry, child.material.map, child.matrix)),
    script: (gltfExtensions && gltfExtensions.script.source && typeof gltfExtensions.script.source === 'string') ? gltfExtensions.script.source : null,
    /* shader: {
      vertex: (gltfExtensions && gltfExtensions.shader && typeof gltfExtensions.shader.vertex === 'string') ? gltfExtensions.shader.vertex : null,
      fragment: (gltfExtensions && gltfExtensions.shader && typeof gltfExtensions.shader.fragment === 'string') ? gltfExtensions.shader.fragment : null,
    }, */
  };
};