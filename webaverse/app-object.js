import * as THREE from './three.module.js';

const camera = new THREE.PerspectiveCamera(60, globalThis.innerWidth / globalThis.innerHeight, 0.1, 10000);
camera.position.set(0, 1.6, 0);
camera.rotation.order = 'YXZ';

const copyScenePlaneGeometry = new THREE.PlaneGeometry(2, 2);
const copySceneVertexShader = `#version 300 es
  precision highp float;

  in vec3 position;
  in vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  out vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const copyScene = (() => {
  const mesh = new THREE.Mesh(
    copyScenePlaneGeometry,
    new THREE.RawShaderMaterial({
      uniforms: {
        tex: {
          value: null,
          // needsUpdate: false,
        },
      },
      vertexShader: copySceneVertexShader,
      fragmentShader: `#version 300 es
        precision highp float;

        uniform sampler2D tex;
        in vec2 vUv;
        out vec4 fragColor;
        
        void main() {
          fragColor = texture(tex, vUv);
        }
      `,
      depthWrite: false,
      depthTest: false,
    })
  );
  const scene = new THREE.Scene();
  scene.add(mesh);
  scene.mesh = mesh;
  return scene;
})();
const copySceneCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export {camera, /*orbitControls,*/ copyScenePlaneGeometry, copySceneVertexShader, copyScene, copySceneCamera};