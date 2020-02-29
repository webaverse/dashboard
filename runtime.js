export function makeObjectState() {
  return {};
};
export function bindObjectScript(objectState, scriptSrc, objectMeshes) {
  if (objectState.worker) {
    objectState.worker.terminate();
    objectState.worker = null;
  }
  if (scriptSrc) {
    objectState.worker = new Worker('./object-worker.js');
    objectState.worker.postMessage({
      method: 'init',
      args: {
        scriptSrc,
        numObjects: objectMeshes.length,
      },
    });
    let ticking = false;
    objectState.worker.tick = () => {
      if (!ticking) {
        ticking = true;

        objectState.worker.postMessage({
          method: 'tick',
        });
      }
    };
    objectState.worker.addEventListener('message', e => {
      const {method, args} = e.data;
      switch (method) {
        case 'tock': {
          ticking = false;
          break;
        }
        case 'update': {
          const {attribute, index, value} = args;
          switch (attribute) {
            case 'position': {
              objectMeshes[index].position.fromArray(value);
              break;
            }
            case 'quaternion': {
              objectMeshes[index].quaternion.fromArray(value);
              break;
            }
            case 'scale': {
              objectMeshes[index].scale.fromArray(value);
              break;
            }
            default: {
              console.warn('invalid worker update attribute', attribute);
              break;
            }
          }
          break;
        }
        default: {
          console.warn('invalid worker method', method);
          break;
        }
      }
    });
  }
};
export function tickObjectScript(objectState) {
  objectState.worker && objectState.worker.tick();
};
/* export function bindObjectShader(objectMeshes, vertex, fragment) {
  // XXX
}; */