const undos = [];
const redos = [];
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
    default: {
      throw new Error('unknown action method: ' + method);
    }
  }
}
export function execute(action) {
  redos.length = 0;
  action.forward();
  undos.push(action);
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