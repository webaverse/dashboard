// console.log('object worker started');

const renderer = new EventTarget();

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
    this.onchange = null;
  }
  set(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    this.onchange && this.onchange(x, y, z);
  }
  get x() { return this._x; }
  set x(v) { this._x = v; this.onchange && this.onchange(this._x, this._y, this._z); }
  get y() { return this._y; }
  set y(v) { this._y = v; this.onchange && this.onchange(this._x, this._y, this._z); }
  get z() { return this._z; }
  set z(v) { this._z = v; this.onchange && this.onchange(this._x, this._y, this._z); }
}
class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.onchange = null;
  }
  set(x, y, z, w) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.onchange && this.onchange(x, y, z, w);
  }
  get x() { return this._x; }
  set x(v) { this._x = v; this.onchange && this.onchange(this._x, this._y, this._z, this._w); }
  get y() { return this._y; }
  set y(v) { this._y = v; this.onchange && this.onchange(this._x, this._y, this._z, this._w); }
  get z() { return this._z; }
  set z(v) { this._z = v; this.onchange && this.onchange(this._x, this._y, this._z, this._w); }
  get w() { return this._w; }
  set w(v) { this._w = v; this.onchange && this.onchange(this._x, this._y, this._z, this._w); }
}
class Entity extends EventTarget {
  constructor() {
    super();

    this.position = new Vector3();
    this.position.onchange = (x, y, z) => {
      self.postMessage({
        method: 'update',
        args: {
          attribute: 'position',
          value: [x, y, z],
        },
      });
    };
    this.quaternion = new Quaternion();
    this.quaternion.onchange = (x, y, z, w) => {
      self.postMessage({
        method: 'update',
        args: {
          attribute: 'quaternion',
          value: [x, y, z, w],
        },
      });
    };
    this.scale = new Vector3();
    this.scale.onchange = (x, y, z) => {
      self.postMessage({
        method: 'update',
        args: {
          attribute: 'scale',
          value: [x, y, z],
        },
      });
    };
  }
}
const object = new Entity();

self.onmessage = e => {
  const {method, args} = e.data;
  switch (method) {
    case 'init': {
      const {scriptSrc} = args;
      try {
        eval(scriptSrc);
      } catch(err) {
        console.warn(err);
      }
      break;
    }
    case 'tick': {
      try {
        renderer.dispatchEvent(new MessageEvent('tick'));
      } catch(err) {
        console.warn(err);
      }
      self.postMessage({
        method: 'tock',
        args: {},
      });
      break;
    }
    case 'event': {
      break;
    }
    default: {
      console.warn('got unknown object worker method', method);
      break;
    }
  }
};