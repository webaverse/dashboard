import * as THREE from '../libs/three.module.js';
import {GLTFLoader} from '../libs/GLTFLoader.js';
import {GLTFExporter} from '../libs/GLTFExporter.js';

import wbn from "./wbn";
import {blobToFile, makePromise, downloadFile, convertMeshToPhysicsMesh, bindUploadFileButton, getExt} from './util';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localTriangle = new THREE.Triangle();
const textEncoder = new TextEncoder();

const typeHandlers = {
  'gltf': "",
  'glb': "",
  'bin': "",
  'vrm': "",
  'vox': "",
  'png': "",
  'gif': "",
  'jpg': "",
  'js': "",
  'json': "",
  'wbn': "",
  'scn': "",
  'url': "",
  'iframe': "",
  'mediastream': "",
  'geo': "",
  'mp3': "",
  'mp4': ""
};

const primaryUrl = 'https://xrpk.webaverse.com';
const _filterCandidateFiles = files => {
  const result = [];
  for (const type in typeHandlers) {
    for (const file of files) {
      const ext = getExt(file.name);
      if (ext === type) {
        result.push(file);
      }
    }
  }
  return result;
};

export async function makeWbn(files) {
  if (files.length > 0) {
    
    for (const file of files) {
      const {type, webkitRelativePath} = file;
      const path = webkitRelativePath.replace(/^[^/]*\//, '');
      file.path = path;
    }
    const candidateFiles = _filterCandidateFiles(files);
    const file = candidateFiles[0];
    if (file) {
      const primaryExchangeUrl = primaryUrl + '/manifest.json';
      const builder = new wbn.BundleBuilder(primaryExchangeUrl);
      for (const file of files) {
        const {type, name} = file;
        const u = new URL(name, primaryUrl);
        const arrayBuffer = await file.arrayBuffer();
        builder.addExchange(u.href, 200, {
          'Content-Type': type || '/application/octet-stream',
        }, new Uint8Array(arrayBuffer));
      }

      const hadManifestJson = files.some(file => file.name === 'manifest.json');
      if (!hadManifestJson) {
        const manifestJson = {
          start_url: encodeURI(file.name),
        };
        const manifestJsonString = JSON.stringify(manifestJson, null, 2);
        builder.addExchange(primaryUrl + '/manifest.json', 200, {
          'Content-Type': 'application/json',
        }, textEncoder.encode(manifestJsonString));
      }

      const buffer = builder.createBundle();
      const blob = new Blob([buffer], {
        type: 'application/webbundle',
      });
      const wbnFile = blobToFile(blob, 'bundle.wbn');
      return wbnFile;
    } else {
      window.alert('This folder does not have any XRPK-able file types.\nAllowed types: ' + Object.keys(typeHandlers).join(', '));
    }
  }
}

export async function makeBin (files) {
  const [file] = files;

  if (file) {
    const geometryWorker = (() => {  
      class Allocator {
        constructor() {
          this.offsets = [];
        }

        alloc(constructor, size) {
          if (size > 0) {
            const offset = moduleInstance._malloc(size * constructor.BYTES_PER_ELEMENT);
            const b = new constructor(moduleInstance.HEAP8.buffer, moduleInstance.HEAP8.byteOffset + offset, size);
            b.offset = offset;
            this.offsets.push(offset);
            return b;
          } else {
            return new constructor(moduleInstance.HEAP8.buffer, 0, 0);
          }
        }

        freeAll() {
          for (let i = 0; i < this.offsets.length; i++) {
            moduleInstance._doFree(this.offsets[i]);
          }
          this.offsets.length = 0;
        }
      }

      const maxNumMessageArgs = 32;
      const messageSize =
        Int32Array.BYTES_PER_ELEMENT + // id
        Int32Array.BYTES_PER_ELEMENT + // method
        Int32Array.BYTES_PER_ELEMENT + // priority
        maxNumMessageArgs*Uint32Array.BYTES_PER_ELEMENT; // args
      const maxNumMessages = 1024;
      const callStackSize = maxNumMessages * messageSize;
      class CallStackMessage {
        constructor(ptr) {
          this.dataView = new DataView(moduleInstance.HEAP8.buffer, ptr, messageSize);
          this.offset = 3*Uint32Array.BYTES_PER_ELEMENT;
        }
        getId() {
          return this.dataView.getInt32(0, true);
        }
        getMethod() {
          return this.dataView.getInt32(Uint32Array.BYTES_PER_ELEMENT, true);
        }
        getPriority() {
          return this.dataView.getInt32(2*Uint32Array.BYTES_PER_ELEMENT, true);
        }
        setId(v) {
          this.dataView.setInt32(0, v, true);
        }
        setMethod(v) {
          this.dataView.setInt32(Uint32Array.BYTES_PER_ELEMENT, v, true);
        }
        setPriority(v) {
          this.dataView.setInt32(2*Uint32Array.BYTES_PER_ELEMENT, v, true);
        }
        pullU8Array(length) {
          const {offset} = this;
          this.offset += length;
          return new Uint8Array(this.dataView.buffer, this.dataView.byteOffset + offset, length);;
        }
        pullF32Array(length) {
          const {offset} = this;
          this.offset += length*Float32Array.BYTES_PER_ELEMENT;
          return new Float32Array(this.dataView.buffer, this.dataView.byteOffset + offset, length);
        }
        pullI32() {
          const {offset} = this;
          this.offset += Int32Array.BYTES_PER_ELEMENT;
          return this.dataView.getInt32(offset, true);;
        }
        pullU32() {
          const {offset} = this;
          this.offset += Uint32Array.BYTES_PER_ELEMENT;
          return this.dataView.getUint32(offset, true);;
        }
        pullF32() {
          const {offset} = this;
          this.offset += Float32Array.BYTES_PER_ELEMENT;
          return this.dataView.getFloat32(offset, true);
        }
        pushU8Array(uint8Array) {
          new Uint8Array(this.dataView.buffer, this.dataView.byteOffset + this.offset, uint8Array.length).set(uint8Array);
          this.offset += uint8Array.byteLength;
        }
        pushF32Array(float32Array) {
          new Float32Array(this.dataView.buffer, this.dataView.byteOffset + this.offset, float32Array.length).set(float32Array);
          this.offset += float32Array.byteLength;
        }
        pushI32(v) {
          this.dataView.setInt32(this.offset, v, true);
          this.offset += Int32Array.BYTES_PER_ELEMENT;
        }
        pushU32(v) {
          this.dataView.setUint32(this.offset, v, true);
          this.offset += Uint32Array.BYTES_PER_ELEMENT;
        }
        pushF32(v) {
          this.dataView.setFloat32(this.offset, v, true);
          this.offset += Float32Array.BYTES_PER_ELEMENT;
        }
        /* pullU8Array(length) {
          if (this.offset + length <= messageSize) {
            const result = new Uint8Array(this.dataView.buffer, this.dataView.byteOffset + this.offset, length);
            this.offset += length;
            return result;
          } else {
            throw new Error('message overflow');
          }
        }
        pullF32Array(length) {
          if (this.offset + length*Float32Array.BYTES_PER_ELEMENT <= messageSize) {
            const result = new Float32Array(this.dataView.buffer, this.dataView.byteOffset + this.offset, length);
            this.offset += length*Float32Array.BYTES_PER_ELEMENT;
            return result;
          } else {
            throw new Error('message overflow');
          }
        }
        pullI32() {
          if (this.offset + Int32Array.BYTES_PER_ELEMENT <= messageSize) {
            const result = this.dataView.getInt32(this.offset, true);
            this.offset += Int32Array.BYTES_PER_ELEMENT;
            return result;
          } else {
            throw new Error('message overflow');
          }
        }
        pullU32() {
          if (this.offset + Uint32Array.BYTES_PER_ELEMENT <= messageSize) {
            const result = this.dataView.getUint32(this.offset, true);
            this.offset += Uint32Array.BYTES_PER_ELEMENT;
            return result;
          } else {
            throw new Error('message overflow');
          }
        }
        pullF32() {
          if (this.offset + Float32Array.BYTES_PER_ELEMENT <= messageSize) {
            const result = this.dataView.getFloat32(this.offset, true);
            this.offset += Float32Array.BYTES_PER_ELEMENT;
            return result;
          } else {
            throw new Error('message overflow');
          }
        }
        pushU8Array(uint8Array) {
          if (this.offset + uint8Array.byteLength <= messageSize) {
            new Uint8Array(this.dataView.buffer, this.dataView.byteOffset + this.offset, uint8Array.length).set(uint8Array);
            this.offset += uint8Array.byteLength;
          } else {
            throw new Error('message overflow');
          }
        }
        pushF32Array(float32Array) {
          if (this.offset + float32Array.byteLength <= messageSize) {
            new Float32Array(this.dataView.buffer, this.dataView.byteOffset + this.offset, float32Array.length).set(float32Array);
            this.offset += float32Array.byteLength;
          } else {
            throw new Error('message overflow');
          }
        }
        pushI32(v) {
          if (this.offset + Int32Array.BYTES_PER_ELEMENT <= messageSize) {
            this.dataView.setInt32(this.offset, v, true);
            this.offset += Int32Array.BYTES_PER_ELEMENT;
          } else {
            throw new Error('message overflow');
          }
        }
        pushU32(v) {
          if (this.offset + Uint32Array.BYTES_PER_ELEMENT <= messageSize) {
            this.dataView.setUint32(this.offset, v, true);
            this.offset += Uint32Array.BYTES_PER_ELEMENT;
          } else {
            throw new Error('message overflow');
          }
        }
        pushF32(v) {
          if (this.offset + Float32Array.BYTES_PER_ELEMENT <= messageSize) {
            this.dataView.setFloat32(this.offset, v, true);
            this.offset += Float32Array.BYTES_PER_ELEMENT;
          } else {
            throw new Error('message overflow');
          }
        } */
      }
      class CallStack {
        constructor() {
          this.ptr = moduleInstance._malloc(callStackSize * 2 + Uint32Array.BYTES_PER_ELEMENT);
          this.dataView = new DataView(moduleInstance.HEAP8.buffer, this.ptr, callStackSize);

          this.outPtr = this.ptr + callStackSize;
          this.outDataView = new DataView(moduleInstance.HEAP8.buffer, this.ptr + callStackSize, callStackSize);

          this.outNumEntriesPtr = this.ptr + callStackSize * 2;
          this.outNumEntriesU32 = new Uint32Array(moduleInstance.HEAP8.buffer, this.outNumEntriesPtr, 1);

          this.numEntries = 0;
          this.nextCbId = 0;
        }

        allocRequest(method, prio, startCb, endCb) {
          const index = this.numEntries++;
          const offset = index * messageSize;
          const startMessage = new CallStackMessage(this.ptr + offset);

          const id = ++this.nextCbId;
          startMessage.setId(id);
          startMessage.setMethod(method);
          startMessage.setPriority(+prio);
          
          startCb(startMessage);
          cbIndex.set(id, endCb);
        }

        reset() {
          this.numEntries = 0;
        }
      }
      class ScratchStack {
        constructor() {
          const size = 1024*1024;
          this.ptr = moduleInstance._malloc(size);

          this.u8 = new Uint8Array(moduleInstance.HEAP8.buffer, this.ptr, size);
          this.u32 = new Uint32Array(moduleInstance.HEAP8.buffer, this.ptr, size/4);
          this.i32 = new Int32Array(moduleInstance.HEAP8.buffer, this.ptr, size/4);
          this.f32 = new Float32Array(moduleInstance.HEAP8.buffer, this.ptr, size/4);
        }
      }
      
      const modulePromise = makePromise();
      /* const INITIAL_INITIAL_MEMORY = 52428800;
      const WASM_PAGE_SIZE = 65536;
      const wasmMemory = new WebAssembly.Memory({
        "initial": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
        "maximum": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
        "shared": true,
      }); */
      let localModuleInstance = null;
      let moduleInstance = null;
      let threadPool;
      let callStack;
      let scratchStack;
      // GeometryModule({
        // ENVIRONMENT_IS_PTHREAD: true,
        // wasmMemory,
        // buffer: wasmMemory.buffer,
        // noInitialRun: true,
        // noExitRuntime: true,
        Module.onRuntimeInitialized = function() {
          localModuleInstance = this;
        };
        Module.postRun = () => {
          moduleInstance = localModuleInstance;
          // moduleInstance._globalInit();
          // callStack = new CallStack();
          scratchStack = new ScratchStack();
          // threadPool = moduleInstance._makeThreadPool(1);
          // threadPool = moduleInstance._getThreadPool();
          modulePromise.accept();
        };
        if (Module.calledRun) {
          Module.onRuntimeInitialized();
          Module.postRun();
        }
      // });

      let methodIndex = 0;
      const cbIndex = new Map();
      const w = {};
      w.waitForLoad = () => modulePromise;
      w.alloc = (constructor, count) => {
        if (count > 0) {
          const size = constructor.BYTES_PER_ELEMENT * count;
          const ptr = moduleInstance._doMalloc(size);
          return new constructor(moduleInstance.HEAP8.buffer, ptr, count);
        } else {
          return new constructor(moduleInstance.HEAP8.buffer, 0, 0);
        }
      };
      w.free = ptr => {
        moduleInstance._doFree(ptr);
      };
      w.makePhysics = () => moduleInstance._makePhysics();
      w.simulatePhysics = (physics, updates, elapsedTime) => {
        const maxNumUpdates = 10;
        let index = 0;
        const ids = scratchStack.u32.subarray(index, index + maxNumUpdates);
        index += maxNumUpdates;
        const positions = scratchStack.f32.subarray(index, index + maxNumUpdates*3);
        index += maxNumUpdates*3;
        const quaternions = scratchStack.f32.subarray(index, index + maxNumUpdates*4);
        index += maxNumUpdates*4;

        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];
          ids[i] = update.id;
          update.position.toArray(positions, i*3);
          update.quaternion.toArray(quaternions, i*4);
        }

        const numNewUpdates = moduleInstance._simulatePhysics(
          physics,
          ids.byteOffset,
          positions.byteOffset,
          quaternions.byteOffset,
          updates.length,
          elapsedTime
        );
        
        const newUpdates = Array(numNewUpdates);
        for (let i = 0; i < numNewUpdates; i++) {
          newUpdates[i] = {
            id: ids[i],
            position: new THREE.Vector3().fromArray(positions, i*3),
            quaternion: new THREE.Quaternion().fromArray(quaternions, i*4),
          };
        }
        
        return newUpdates;
      };
      w.requestAddObject = (tracker, geometrySet, name, position, quaternion) => new Promise((accept, reject) => {
        callStack.allocRequest(METHODS.addObject, true, m => {
          m.pushU32(tracker);
          m.pushU32(geometrySet);

          const srcNameUint8Array = textEncoder.encode(name);
          const srcNameUint8Array2 = new Uint8Array(MAX_NAME_LENGTH);
          srcNameUint8Array2.set(srcNameUint8Array);
          srcNameUint8Array2[srcNameUint8Array.byteLength] = 0;
          m.pushU8Array(srcNameUint8Array2);

          m.pushF32Array(position.toArray(new Float32Array(3)));
          m.pushF32Array(quaternion.toArray(new Float32Array(4)));
        }, m => {
          const objectId = m.pullU32();
          const numSubparcels = m.pullU32();
          // console.log('num subparcels add', numSubparcels);
          for (let i = 0; i < numSubparcels; i++) {
            const subparcelOffset = m.pullU32();
            const [landArenaSpec, vegetationArenaSpec, thingArenaSpec] = geometryWorker.getSubparcelArenaSpec(subparcelOffset);
            const {
              positionsFreeEntry,
              uvsFreeEntry,
              idsFreeEntry,
              indicesFreeEntry,
              skyLightsFreeEntry,
              torchLightsFreeEntry,
            } = vegetationArenaSpec;

            const positionsStart = moduleInstance.HEAPU32[positionsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const uvsStart = moduleInstance.HEAPU32[uvsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const idsStart = moduleInstance.HEAPU32[idsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const indicesStart = moduleInstance.HEAPU32[indicesFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const skyLightsStart = moduleInstance.HEAPU32[skyLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const torchLightsStart = moduleInstance.HEAPU32[torchLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];

            const positionsCount = moduleInstance.HEAPU32[positionsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const uvsCount = moduleInstance.HEAPU32[uvsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const idsCount = moduleInstance.HEAPU32[idsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const indicesCount = moduleInstance.HEAPU32[indicesFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const skyLightsCount = moduleInstance.HEAPU32[skyLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const torchLightsCount = moduleInstance.HEAPU32[torchLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];

            geometryManager.currentVegetationMesh.updateGeometry({
              positionsStart,
              uvsStart,
              idsStart,
              indicesStart,
              skyLightsStart,
              torchLightsStart,

              positionsCount,
              uvsCount,
              idsCount,
              indicesCount,
              skyLightsCount,
              torchLightsCount,
            });
          }
          callStack.allocRequest(METHODS.releaseAddRemoveObject, true, m2 => {
            m2.pushU32(tracker);
            m2.pushU32(numSubparcels);
            for (let i = 0; i < numSubparcels; i++) {
              m2.pushU32(m.pullU32());
            }
          }, m => {
            // console.log('done release', numSubparcels);
            accept({
              objectId,
            });
          });
        });
      });
      w.requestRemoveObject = (tracker, geometrySet, sx, sy, sz, objectId) => new Promise((accept, reject) => {
        callStack.allocRequest(METHODS.removeObject, true, m => {
          m.pushU32(tracker);
          m.pushU32(geometrySet);
          m.pushI32(sx);
          m.pushI32(sy);
          m.pushI32(sz);
          m.pushU32(objectId);
        }, m => {
          const numSubparcels = m.pullU32();
          for (let i = 0; i < numSubparcels; i++) {
            const subparcelOffset = m.pullU32();
            const [landArenaSpec, vegetationArenaSpec, thingArenaSpec] = geometryWorker.getSubparcelArenaSpec(subparcelOffset);
            const {
              positionsFreeEntry,
              uvsFreeEntry,
              idsFreeEntry,
              indicesFreeEntry,
              skyLightsFreeEntry,
              torchLightsFreeEntry,
            } = vegetationArenaSpec;

            const positionsStart = moduleInstance.HEAPU32[positionsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const uvsStart = moduleInstance.HEAPU32[uvsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const idsStart = moduleInstance.HEAPU32[idsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const indicesStart = moduleInstance.HEAPU32[indicesFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const skyLightsStart = moduleInstance.HEAPU32[skyLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];
            const torchLightsStart = moduleInstance.HEAPU32[torchLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT];

            const positionsCount = moduleInstance.HEAPU32[positionsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const uvsCount = moduleInstance.HEAPU32[uvsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const idsCount = moduleInstance.HEAPU32[idsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const indicesCount = moduleInstance.HEAPU32[indicesFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const skyLightsCount = moduleInstance.HEAPU32[skyLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];
            const torchLightsCount = moduleInstance.HEAPU32[torchLightsFreeEntry / Uint32Array.BYTES_PER_ELEMENT + 1];

            geometryManager.currentVegetationMesh.updateGeometry({
              positionsStart,
              uvsStart,
              idsStart,
              indicesStart,
              skyLightsStart,
              torchLightsStart,

              positionsCount,
              uvsCount,
              idsCount,
              indicesCount,
              skyLightsCount,
              torchLightsCount,
            });
          }
          callStack.allocRequest(METHODS.releaseAddRemoveObject, true, m2 => {
            m2.pushU32(tracker);
            m2.pushU32(numSubparcels);
            for (let i = 0; i < numSubparcels; i++) {
              m2.pushU32(m.pullU32());
            }
          }, m => {
            // console.log('done release', numSubparcels);
            accept();
          });
        });
      });
      w.cookGeometryPhysics = (physics, mesh) => {
        mesh.updateMatrixWorld();
        const {geometry} = mesh;

        const allocator = new Allocator();
        const positions = allocator.alloc(Float32Array, geometry.attributes.position.count * 3);
        positions.set(geometry.attributes.position.array);
        const indices = allocator.alloc(Uint32Array, geometry.index.count);
        indices.set(geometry.index.array);
        moduleInstance._cookGeometryPhysics(
          physics,
          positions.byteOffset,
          indices.byteOffset,
          positions.length,
          indices.length,
          scratchStack.u32.byteOffset,
          scratchStack.u32.byteOffset + Uint32Array.BYTES_PER_ELEMENT,
          scratchStack.u32.byteOffset + Uint32Array.BYTES_PER_ELEMENT*2,
        );

        const dataPtr = scratchStack.u32[0];
        const dataLength = scratchStack.u32[1];
        const streamPtr = scratchStack.u32[2];
        
        const result = new Uint8Array(dataLength);
        result.set(new Uint8Array(moduleInstance.HEAP8.buffer, dataPtr, dataLength));
        allocator.freeAll();
        return result;
      };
      w.addBoxGeometryPhysics = (physics, position, quaternion, size, id, dynamic) => {
        const allocator = new Allocator();
        const p = allocator.alloc(Float32Array, 3);
        const q = allocator.alloc(Float32Array, 4);
        const s = allocator.alloc(Float32Array, 3);
        
        position.toArray(p);
        quaternion.toArray(q);
        size.toArray(s);
        
        moduleInstance._addBoxGeometryPhysics(
          physics,
          p.byteOffset,
          q.byteOffset,
          s.byteOffset,
          id,
          +dynamic,
        );
        allocator.freeAll();
      };
      w.update = () => {
        if (moduleInstance) {
          if (geometryManager.currentChunkMesh) {
            const neededCoordsOffset = moduleInstance._updateNeededCoords(
              geometryManager.tracker,
              geometryManager.currentChunkMesh.currentPosition.x,
              geometryManager.currentChunkMesh.currentPosition.y,
              geometryManager.currentChunkMesh.currentPosition.z,
            );
            if (neededCoordsOffset) {
              const addedSubparcelsOffset = moduleInstance.HEAPU32[neededCoordsOffset / Uint32Array.BYTES_PER_ELEMENT];
              const numAddedSubparcels = moduleInstance.HEAPU32[neededCoordsOffset / Uint32Array.BYTES_PER_ELEMENT + 1];

              (async () => {
                for (let i = 0; i < numAddedSubparcels; i++) {
                  const subparcelOffset = moduleInstance.HEAP32[addedSubparcelsOffset / Uint32Array.BYTES_PER_ELEMENT + i];
                  /* const index = moduleInstance.HEAP32[subparcelOffset / Uint32Array.BYTES_PER_ELEMENT + 3];
                  const uint8Array = await storage.getRawTemp(`subparcel:${index}`); */
                  moduleInstance._subparcelUpdate(
                    geometryManager.tracker,
                    threadPool,
                    geometryManager.geometrySet,
                    neededCoordsOffset,
                    subparcelOffset,
                    1
                  );
                }
              })().then(() => {
                moduleInstance._finishUpdate(
                  geometryManager.tracker,
                  neededCoordsOffset,
                );
              });
            }
          }

          callStack.outNumEntriesU32[0] = maxNumMessages;
          moduleInstance._tick(
            threadPool,
            callStack.ptr,
            callStack.numEntries,
            callStack.outPtr,
            callStack.outNumEntriesPtr,
          );
          callStack.reset();
          const numMessages = callStack.outNumEntriesU32[0];
          for (let i = 0; i < numMessages; i++) {
            const offset = i*messageSize;
            const endMessage = new CallStackMessage(callStack.outPtr + offset);
            const id = endMessage.getId();
            const method = endMessage.getMethod();

            if (id > 0) {
              const cb = cbIndex.get(id);
              if (cb) {
                cb(endMessage);
                cbIndex.delete(id);
              } else {
                throw new Error('invalid callback id: ' + id);
              }
            } else if (id === -1) {
              const cb = MESSAGES[method];
              if (cb) {
                cb(endMessage);
              } else {
                throw new Error('invalid message method: ' + method);
              }
            } else {
              throw new Error('invalid id: ' + id);
            }
          }
        }
      };
      return w;
    })();

    await geometryWorker.waitForLoad();
    const physics = geometryWorker.makePhysics();

    let o = await new Promise((accept, reject) => {
      const u = URL.createObjectURL(file);
      new GLTFLoader().load(u, accept, function onprogress() {}, reject);
    });
    o = o.scene;
    const physicsMesh = convertMeshToPhysicsMesh(o);
    const physicsBuffer = await geometryWorker.cookGeometryPhysics(physics, physicsMesh);
    const b = new Blob([physicsBuffer], {
      type: 'application/octet-stream',
    });
    const binFile = blobToFile(b, 'target.bin');
    return binFile;
  }
}

export const makePhysicsBake = async (file) => {
  if (file && getExt(file[0].name) === "glb") {
    let bin;
    try {
      bin = await makeBin(file)
    } catch(err) {
      console.warn(err);
      bin = null;
    }

    const manifest = {
      "xr_type": "webxr-site@0.0.1",
      "start_url": file[0].name,
    };
    if (bin) {
      manifest['physics_url'] = bin.name;
    }
    const blob = new Blob([JSON.stringify(manifest)], {type: "application/json"});
    const manifestFile = blobToFile(blob, "manifest.json");

    const modelBlob = new Blob([file[0]], {type: file[0].type});
    const model = blobToFile(modelBlob, file[0].name);
    const files = [model, manifestFile];
    if (bin) {
      files.push(bin);
    }

    const wbn = await makeWbn(files);
    return wbn;
  } else {
    alert("Please you a valid .glb model");
    return null;
  }
}