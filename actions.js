const undos = [];
const redos = [];
export function createAction(method, args) {
  switch (method) {
    case 'add': {
      const {scene, object} = args;
      return {
        forward() {
          scene.add(object);
        },
        back() {
          scene.remove(object);
        },
      };
      break;
    }
    case 'remove': {
      const {scene, object} = args;
      return {
        forward() {
          scene.remove(object);
        },
        back() {
          scene.add(object);
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
export function clear() {
  undos.length = 0;
  redos.length = 0;
}