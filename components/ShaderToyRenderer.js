import {useState, useEffect} from 'react';
import * as THREE from '../webaverse/three.module.js';
import {scene, camera, copyScenePlaneGeometry, copySceneVertexShader, copyScene, copySceneCamera} from '../webaverse/app-object.js';
import {schedulePerFrame} from '../webaverse/util.js';

const size = 512;
const worldSize = 2;
const hackShaderName = 'anime radial';

const _makeRenderTarget = () => new THREE.WebGLRenderTarget(size, size, {
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
  encoding: THREE.sRGBEncoding,
});
const copyBuffer = _makeRenderTarget();
class ShaderToyPass {
  constructor({type, is, code, os, renderer, renderTarget}, parent) {
    this.type = type;
    this.is = is;
    this.code = code;
    this.os = os;
    this.renderer = renderer;
    this.renderTarget = renderTarget;
    this.parent = parent;

    const uniforms = {
      modelViewMatrix: {
        value: new THREE.Matrix4().multiplyMatrices(copySceneCamera.matrixWorldInverse, copySceneCamera.matrixWorld),
      },
      projectionMatrix: {
        value: copySceneCamera.projectionMatrix,
      },
      iResolution: {
        value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1),
      },
      iTime: {
        value: parent.getITime(),
      },
      iFrame: {
        value: parent.getIFrame(),
      },
      iMouse: {
        value: new THREE.Vector4(0, 0, 0, 0),
      },
      iSampleRate: {
        value: 44100,
      },
    };
    for (const input of is) {
      let {channel, buffer} = input;
      if (!buffer.isTexture) {
        buffer = buffer.texture;
      }
      uniforms['iChannel' + channel] = {
        value: buffer,
      };
      if (!uniforms['iChannelResolution']) {
        uniforms['iChannelResolution'] = {
          value: [],
        };
      }
      uniforms['iChannelResolution'].value[channel] = new THREE.Vector3(buffer.image.width, buffer.image.height, 1);
    }
    this.mesh = new THREE.Mesh(
      copyScenePlaneGeometry,
      new THREE.RawShaderMaterial({
        uniforms,
        vertexShader: copySceneVertexShader,
        fragmentShader: `#version 300 es
          precision highp float;

          uniform vec3      iResolution;           // viewport resolution (in pixels)
          uniform float     iTime;                 // shader playback time (in seconds)
          uniform float     iTimeDelta;            // render time (in seconds)
          uniform int       iFrame;                // shader playback frame
          uniform float     iChannelTime[4];       // channel playback time (in seconds)
          uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
          uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
          uniform sampler2D iChannel0;          // input channel. XX = 2D/Cube
          uniform sampler2D iChannel1;          // input channel. XX = 2D/Cube
          uniform sampler2D iChannel2;          // input channel. XX = 2D/Cube
          uniform sampler2D iChannel3;          // input channel. XX = 2D/Cube
          uniform vec4      iDate;                 // (year, month, day, time in seconds)
          uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
          in vec2 vUv;
          out vec4 fragColor;
          
          ${this.code}

          void main() {
            vec2 fragCoord = vUv * iResolution.xy;
            mainImage(fragColor, fragCoord);
            fragColor.a = 1.;
            // ${this.type === 'image' ? `fragColor.a = 1.;` : ''};
            // fragColor = vec4(vUv, 0.0, 1.0);
          }
        `,
        depthWrite: false,
        depthTest: false,
      })
    );
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
  }
  update() {
    this.mesh.material.uniforms.iTime.value = this.parent.getITime();
    this.mesh.material.uniforms.iFrame.value = this.parent.getIFrame();
    
    {
      const [{buffer} = {}] = this.os;
      if (buffer) {
        const {renderer} = this;
        const oldRenderTarget = renderer.getRenderTarget();
        if (this.is.some(input => input.buffer === buffer)) {
          renderer.setRenderTarget(copyBuffer);
          renderer.clear();
          renderer.render(this.scene, copySceneCamera);

          copyScene.mesh.material.uniforms.tex.value = copyBuffer.texture;
          renderer.setRenderTarget(buffer);
          renderer.clear();
          renderer.render(copyScene, copySceneCamera);
        } else {
          renderer.setRenderTarget(buffer);
          renderer.clear();
          renderer.render(this.scene, copySceneCamera);
        }
        
        renderer.setRenderTarget(oldRenderTarget);
      }
    }

    if (this.type === 'buffer') {
      
    } else if (this.type === 'image') {
      const {renderer} = this;
      const oldRenderTarget = renderer.getRenderTarget();

      renderer.setRenderTarget(this.renderTarget);
      renderer.clear();
      renderer.render(this.scene, copySceneCamera);

      renderer.setRenderTarget(oldRenderTarget);
    } else {
      throw new Error('unknown pass type: ' + this.type);
    }
  }
}
/* const _makeRenderTargetMesh = renderTarget => {
  const geometry = new THREE.PlaneBufferGeometry(worldSize, worldSize);
  const material = new THREE.MeshBasicMaterial({
    // color: 0xFF0000,
    map: renderTarget.texture,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.onBeforeRender = () => {
    const context = renderer.getContext();
    context.disable(context.SAMPLE_ALPHA_TO_COVERAGE);
  };
  mesh.onAfterRender = () => {
    const context = renderer.getContext();
    context.enable(context.SAMPLE_ALPHA_TO_COVERAGE);
  };
  return mesh;
};
let numRenderTargetMeshes = 0; */
/* const _addDebugRenderTargetMesh = renderTarget => {
  const mesh = _makeRenderTargetMesh(renderTarget);
  mesh.position.set(-3 + numRenderTargetMeshes * worldSize, worldSize/2, -1);
  scene.add(mesh);
  numRenderTargetMeshes++;
}; */
class ShadertoyRenderer {
  constructor({
    canvas,
    shader,
  }) {
    // this.shader = shader;
    
    this.camera = copySceneCamera;
    this.scene = (() => {
      const mesh = new THREE.Mesh(
        copyScenePlaneGeometry,
        new THREE.RawShaderMaterial({
          uniforms: {
            colorTex: {
              value: null,
              // needsUpdate: false,
            },
          },
          vertexShader: copySceneVertexShader,
          fragmentShader: `#version 300 es
            precision highp float;

            uniform sampler2D colorTex;
            in vec2 vUv;
            out vec4 fragColor;

            void main() {
              fragColor = texture(colorTex, vUv);
            }
          `,
          depthWrite: false,
          depthTest: false,
        })
      );
      mesh.frustumCulled = false;
      
      /* const mesh = new THREE.Mesh(
        copyScenePlaneGeometry,
        new THREE.ShaderMaterial({
          uniforms: {
            colorTex: {
              value: null,
              // needsUpdate: false,
            },
          },
          vertexShader: `\
            out vec2 vUv;

            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `\
            #include <packing>

            uniform sampler2D colorTex;
            in vec2 vUv;
            
            void main() {
              gl_FragColor = vec4(1., 0., 0., 1.);
            }
          `,
          depthWrite: false,
          depthTest: false,
        })
      ); */
      const scene = new THREE.Scene();
      scene.add(mesh);
      scene.mesh = mesh;
      return scene;
    })();

    this.renderer = (() => {
      // let canvas = document.createElement('canvas');
      let context = canvas.getContext('webgl2', {
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
        xrCompatible: true,
      });
      const renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        antialias: true,
        alpha: true,
        // preserveDrawingBuffer: false,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.autoClear = false;
      renderer.sortObjects = false;
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.gammaFactor = 2.2;
      // renderer.shadowMap.enabled = true;
      // renderer.shadowMap.type = THREE.PCFShadowMap;
      if (!canvas) {
        canvas = renderer.domElement;
      }
      if (!context) {
        context = renderer.getContext();
      }
      context.enable(context.SAMPLE_ALPHA_TO_COVERAGE);
      renderer.xr.enabled = true;
      
      return renderer;
    })();
    this.renderTarget = _makeRenderTarget();
    this.textures = {};
    this.buffers = {};
    this.currentTime = 0;
    this.frame = 0;

    const _ensureInput = input => {
      const {id, type, filepath, sampler} = input;
      if (type === 'texture') {
        if (!this.textures[id]) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          const promise = new Promise((accept, reject) => {
            img.addEventListener('load', () => {
              texture.needsUpdate = true;
              accept();
            });
            img.addEventListener('error', reject);
          });
          promises.push(promise);
          img.src = `https://https-shadertoy-com.proxy.exokit.org${filepath}`;
          const texture = new THREE.Texture(img);
          this.textures[id] = texture;
        }
        return this.textures[id];
      } else if (type === 'buffer') {
        if (!this.buffers[id]) {
          this.buffers[id] = _makeRenderTarget();
        }
        return this.buffers[id];
      } else {
        throw new Error('unknown input type: ' + type);
      }
    };

    const promises = [];
    this.renderPasses = [];
    let renderPassIos = [];
    const _initRenderPassIos = () => {
      renderPassIos = shader.renderpass.map(rp => {
        const {inputs, outputs} = rp;

        const is = [];
        for (const input of inputs) {
          const {channel} = input;
          const buffer = _ensureInput(input);
          const i = {
            channel,
            buffer,
          };
          is.push(i);
        }
        
        const os = [];
        for (const output of outputs) {
          const {id, channel} = output;
          const buffer = _ensureInput({
            id,
            type: 'buffer',
          });
          const o = {
            channel,
            buffer,
          };
          os.push(o);
        }
        
        return {
          is,
          os,
        };
      });
    };
    _initRenderPassIos();

    /* // debugging
    for (const id in this.buffers) {
      _addDebugRenderTargetMesh(this.buffers[id]);
    }
    _addDebugRenderTargetMesh(this.renderTarget); */
    
    const _initRenderPasses = async () => {
      // wait for images to load
      await Promise.all(promises);
      
      for (let i = 0; i < shader.renderpass.length; i++) {
        const {type, code} = shader.renderpass[i];
        const {is, os} = renderPassIos[i];
        const renderPass = new ShaderToyPass({
          type,
          is,
          code,
          os,
          renderer: this.renderer,
          renderTarget: this.renderTarget,
        }, this);
        this.renderPasses.push(renderPass);
      }
    };
    _initRenderPasses();
    
    // this.mesh = _makeRenderTargetMesh(this.renderTarget);

    this.loaded = false;
    this.loadPromise = Promise.all(promises)
      .then(() => {
        this.loaded = true;
      });
  }
  setCurrentTime(currentTime) {
    this.currentTime = currentTime;
  }
  getITime() {
    return this.currentTime;
  }
  getIFrame() {
    return this.frame;
  } 
  waitForLoad() {
    return this.loadPromise;
  }
  update(timeDiff) {
    this.currentTime += timeDiff;
    // console.log('new current time', this.currentTime);
    this.frame++;

    if (this.loaded) {
      // console.log('update start');

      const context = this.renderer.getContext();
      context.disable(context.SAMPLE_ALPHA_TO_COVERAGE);

      for (const renderPass of this.renderPasses) {
        renderPass.update();
      }
      
      context.enable(context.SAMPLE_ALPHA_TO_COVERAGE);
      
      this.scene.mesh.material.uniforms.colorTex.value = this.renderPasses[this.renderPasses.length - 1].os[0].buffer.texture;
      // this.renderer.setClearColor(new THREE.Color(1, 0, 0), 1);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      
      // console.log('update end');
    }
  }
}

/* const shadertoyRenderers = [];
(async () => {
  const res = await fetch('./assets2/shaders.json');
  const shaders = await res.json();
  const shader = shaders.shaders.find(shader => shader.info.name === hackShaderName);
  const shadertoyRenderer = new ShadertoyRenderer({shader});
  await shadertoyRenderer.waitForLoad();
  shadertoyRenderers.push(shadertoyRenderer);
})(); */

const shader = {
 "ver": "0.1",
 "info": {
  "id": "NdfSWj",
  "date": "0",
  "viewed": 0,
  "name": "Fork anime radi avaer 837",
  "description": "Anime Speed Trails (30 min speed painting)",
  "likes": 0,
  "published": "Private",
  "usePreview": 0,
  "tags": [
   "speedpaint"
  ]
 },
 "renderpass": [
  {
   "inputs": [],
   "outputs": [
    {
     "id": "4dfGRr",
     "channel": 0
    }
   ],
   "code": "#define M_PI 3.1415926535897932384626433832795\n\nconst float fps = 60.;\nconst float intensityFactor = 0.5; // .8;\nconst float minRadius = 0.2; // 0.1;\nconst float maxRadius = 0.65;\n\nfloat hash( vec2 p ) {return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);} //Pseudo-random\nfloat smoothNoise( in vec2 p) { //Bilinearly interpolated noise (4 samples)\n    vec2 i = floor( p ); vec2 f = fract( p );\t\n\tvec2 u = f*f*(3.0-2.0*f);\n    float a = hash( i + vec2(0.0,0.0) );\n\tfloat b = hash( i + vec2(1.0,0.0) );\n\tfloat c = hash( i + vec2(0.0,1.0) );\n\tfloat d = hash( i + vec2(1.0,1.0) );\n    return float(a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y)/4.;\n}\n//Funciton to make the noise continuous while wrapping around angle \nfloat rotatedMirror(float t, float r){\n    //t : 0->1\n    t = fract(t+r);\n    return 2.*abs(t-0.5);\n}\n//Some continous radial perlin noise\nconst mat2 m2 = mat2(0.90,0.44,-0.44,0.90);\nfloat radialPerlinNoise(float t, float d){\n    const float BUMP_MAP_UV_SCALE = 44.2;\n    d = pow(d,0.01); //Impression of speed : stretch noise as the distance increases.\n    float dOffset = -floor(iTime*fps)/fps; //Time drift (animation)\n    vec2 p = vec2(rotatedMirror(t,0.1),d+dOffset);\n    float f1 = smoothNoise(p*BUMP_MAP_UV_SCALE);\n    p = 2.1*vec2(rotatedMirror(t,0.4),d+dOffset);\n    float f2 = smoothNoise(p*BUMP_MAP_UV_SCALE);\n    p = 3.7*vec2(rotatedMirror(t,0.8),d+dOffset);\n    float f3 = smoothNoise(p*BUMP_MAP_UV_SCALE);\n    p = 5.8*vec2(rotatedMirror(t,0.0),d+dOffset);\n    float f4 = smoothNoise(p*BUMP_MAP_UV_SCALE);\n    return (f1+0.5*f2+0.25*f3+0.125*f4)*3.;\n}\n//Colorize function (transforms BW Intensity to color)\nvec3 colorize(float f){\n    f = clamp(f*.95,0.0,1.0);\n    vec3 c = mix(vec3(0,0,1.1), vec3(0,1,1), f); //Red-Yellow Gradient\n         c = mix(c, vec3(1,1,1), f*4.-3.0);      //While highlights\n    vec3 cAttenuated = mix(vec3(1), c, f);       //Intensity ramp\n    return cAttenuated;\n}\n/*vec3 colorize(float f){\n    f = clamp(f,0.0,1.0);\n    vec3 c = mix(vec3(1.1,0,0), vec3(1,1,0), f); //Red-Yellow Gradient\n         c = mix(c, vec3(1,1,1), f*10.-9.);      //While highlights\n    vec3 cAttenuated = mix(vec3(0), c, f);       //Intensity ramp\n    return cAttenuated;\n}*/\n//Main image.\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord ){\n    vec2 uv = 2.2*(fragCoord-0.5*vec2(iResolution.xy))/iResolution.xx;\n    float d = dot(uv,uv); //Squared distance\n    float t = 0.5+atan(uv.y,uv.x)/6.28; //Normalized Angle\n    float v = radialPerlinNoise(t,d);\n    //Saturate and offset values\n    v = -2.5+v*4.5;\n    //Intersity ramp from center\n    float f = sin(mod(iTime, 2.) * M_PI);\n    float g = 1.;\n    v = mix(0.,v,intensityFactor*smoothstep(minRadius * (0.9 + f), maxRadius * g, d));\n    //Colorize (palette remap )\n    fragColor.rgb = colorize(v);\n}",
   "name": "Image",
   "description": "",
   "type": "image"
  }
 ]
};

const ShaderToyRenderer = () => {
  // console.log('load shader toy renderer');
  
  // const [loaded, setLoaded] = useState(false);
  const [shaderToyRenderer, setShaderToyRenderer] = useState(null);
  const [resizeListening, setResizeListening] = useState(false);
  
  const _resize = e => {
    // if (shaderToyRenderer) {
      shaderToyRenderer.renderer.setSize(window.innerWidth, window.innerHeight);
      for (const renderPass of shaderToyRenderer.renderPasses) {
        renderPass.mesh.material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
      }
      
    // }
  };
  
  let el = null;
  let lastTimestamp = Date.now();
  useEffect(async () => {
    if (!shaderToyRenderer && el) {
      const newShaderToyRenderer = new ShadertoyRenderer({
        canvas: el,
        shader,
      });
      // console.log('new renderer', shaderToyRenderer);
      
      await newShaderToyRenderer.waitForLoad();
      
      setShaderToyRenderer(newShaderToyRenderer);
    }
  });
  useEffect(() => {
    if (shaderToyRenderer && !resizeListening) {
      window.addEventListener('resize', _resize);
      
      setResizeListening(true);
    }
  }, [shaderToyRenderer, resizeListening]);
  
  {
    let frame = null;
    const _scheduleFrame = () => {
      frame = requestAnimationFrame(_recurse);
    };
    const _recurse = () => {
      if (frame) {
        _scheduleFrame();
        
        // console.log('rendering', shaderToyRenderer);
        if (shaderToyRenderer) {
          const now = Date.now();
          const timeDiff = now - lastTimestamp;
          lastTimestamp = now;
          shaderToyRenderer.update(timeDiff/1000);
        }
      }
    };
    schedulePerFrame(() => {
      _scheduleFrame();
    }, () => {
      frame && cancelAnimationFrame(frame);
      frame = null;
    });
  }
  
  return (
    <canvas ref={newEl => {
      el = newEl;
    }} />
  );
};
export default ShaderToyRenderer;