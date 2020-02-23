let renderer = null;
let camera = null;
const screenshot = async (scene, cameraPosition, cameraQuaternion, options = {}) => {
  const width = typeof options.width === 'number' ? options.width : 1024;
  const height = typeof options.height === 'number' ? options.height : 1024;

  // const scene = new THREE.Scene();

  if (options.lights) {
    options.lights.forEach(light => {
      scene.add(light);
    });
  } else {
    const ambientLight = new THREE.AmbientLight(0x808080);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(0.5, 1, 0.5);
    scene.add(directionalLight);
  }

  /* const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper); */

  if (!camera) {
    camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 100);
  }
  camera.position.copy(cameraPosition);
  //camera.lookAt(model.boundingBoxMesh.getWorldPosition(new THREE.Vector3()));
  // const localAabb = model.boundingBoxMesh.scale.clone().applyQuaternion(model.quaternion);
  // const modelHeight = Math.max(model.boundingBoxMesh.scale.x, model.boundingBoxMesh.scale.y, model.boundingBoxMesh.scale.z);
  // camera.fov = 2 * Math.atan( modelHeight / ( 2 * dist ) ) * ( 180 / Math.PI );
  // camera.updateProjectionMatrix();

  // camera.lookAt(model.boundingBoxMesh.getWorldPosition(new THREE.Vector3()));

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
  }
  renderer.setSize(width, height);

  renderer.render(scene, camera);

  const blob = await new Promise((accept, reject) => {
    renderer.domElement.toBlob(accept, 'image/png');
  });
  return blob;
};
export default screenshot;
