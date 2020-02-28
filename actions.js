import {objectImage} from './object.js';

let undos = [];
let redos = [];
const maxHistoryLength = 20;
export function createAction(method, args) {
  switch (method) {
    case 'addObject': {
      const {container, objectMesh, objectMeshes} = args;
      return {
        forward() {
          container.add(objectMesh);
          objectMeshes.push(objectMesh);
        },
        back() {
          container.remove(objectMesh);
          objectMeshes.splice(objectMeshes.indexOf(objectMesh), 1);
        },
      };
      break;
    }
    case 'removeObject': {
      const {container, objectMesh, objectMeshes} = args;
      return {
        forward() {
          container.remove(objectMesh);
          objectMeshes.splice(objectMeshes.indexOf(objectMesh), 1);
        },
        back() {
          container.add(objectMesh);
          objectMeshes.push(objectMesh);
        },
      };
      break;
    }
    case 'transform': {
      const {object, oldTransform, newTransform} = args;
      return {
        forward() {
          object.position.copy(newTransform.position);
          object.quaternion.copy(newTransform.quaternion);
          object.scale.copy(newTransform.scale);
        },
        back() {
          object.position.copy(oldTransform.position);
          object.quaternion.copy(oldTransform.quaternion);
          object.scale.copy(oldTransform.scale);
        },
      };
      break;
    }
    case 'paint': {
      const {objectMesh, oldColor, newColor} = args;
      const _paint = c => {
        const {geometry} = objectMesh; 
        for (let i = 0; i < geometry.attributes.color.array.length; i += 3) {
          geometry.attributes.color.array[i] = c.r;
          geometry.attributes.color.array[i+1] = c.g;
          geometry.attributes.color.array[i+2] = c.b;
        }
        geometry.attributes.color.needsUpdate = true;
      };
      return {
        forward() {
          _paint(newColor);
        },
        back() {
          _paint(oldColor);
        },
      };
      break;
    }
    case 'pencil': {
      const {objectMeshes, oldCanvases, newCanvases} = args;
      const _setCanvases = canvases => {
        for (let i = 0; i < objectMeshes.length; i++) {
          const objectMesh = objectMeshes[i];
          const canvas = canvases[i];
          if (canvas) {
            objectMesh.material.map.image = canvas;
          } else {
            objectMesh.material.map.image = objectImage;
          }
          objectMesh.material.map.needsUpdate = true;
        }
      };
      return {
        forward() {
          _setCanvases(newCanvases);
        },
        back() {
          _setCanvases(oldCanvases);
        },
      };
      break;
    }
    default: {
      throw new Error('unknown action method: ' + method);
    }
  }
}
export function execute(action) {
  redos.length = 0;
  action.forward();
  undos.push(action);
  if (undos.length > maxHistoryLength) {
    undos = undos.slice(-maxHistoryLength);
  }
}
export function undo() {
  const action = undos.pop();
  if (action) {
    action.back();
    redos.push(action);
  } else {
    console.warn('nothing to undo');
  }
}
export function redo() {
  const action = redos.pop();
  if (action) {
    action.forward();
    undos.push(action);
  } else {
    console.warn('nothing to redo');
  }
}
export function clearHistory() {
  undos.length = 0;
  redos.length = 0;
}