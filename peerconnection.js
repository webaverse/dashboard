const peerPoseUpdateRate = 50;

export function bindPeerConnection(peerConnection) {
  peerConnection.username = 'Anonymous';
  peerConnection.rig = null;
  peerConnection.mediaStream = null;
  let updateInterval = 0;
  peerConnection.addEventListener('open', () => {
    console.log('peer connection open', peerConnection);

    peerConnection.send(JSON.stringify({
      method: 'model',
      url: null,
    }));

    updateInterval = setInterval(() => {
      if (rig) {
        const hmd = {
          position: localVector.copy(rig.inputs.hmd.position).divideScalar(heightFactor).toArray(),
          quaternion: rig.inputs.hmd.quaternion.toArray(),
          scaleFactor: rig.inputs.hmd.scaleFactor,
        };
        const gamepads = [
          {
            position: localVector.copy(rig.inputs.leftGamepad.position).divideScalar(heightFactor).toArray(),
            quaternion: rig.inputs.leftGamepad.quaternion.toArray(),
            pointer: rig.inputs.leftGamepad.pointer,
            grip: rig.inputs.leftGamepad.grip,
            visible: true,
          },
          {
            position: localVector.copy(rig.inputs.rightGamepad.position).divideScalar(heightFactor).toArray(),
            quaternion: rig.inputs.rightGamepad.quaternion.toArray(),
            pointer: rig.inputs.rightGamepad.pointer,
            grip: rig.inputs.rightGamepad.grip,
            visible: true,
          },
        ];
        peerConnection.update(hmd, gamepads);
      }
    }, peerPoseUpdateRate);
  }, {once: true});
  peerConnection.addEventListener('close', () => {
    console.log('peer connection close', peerConnection);

    clearInterval(updateInterval);

    if (peerConnection.rig) {
      peerConnection.rig.destroy();
    }
  }, {once: true});
  peerConnection.addEventListener('pose', e => {
    const {rig} = peerConnection;
    if (rig) {
      const {detail: data} = e;
      const {hmd, gamepads} = data;

      rig.starts.hmd.position.copy(peerConnection.rig.inputs.hmd.position);
      rig.starts.hmd.rotation.copy(peerConnection.rig.inputs.hmd.quaternion);
      rig.starts.hmd.scaleFactor = peerConnection.rig.inputs.hmd.scaleFactor;
      rig.starts.gamepads[0].position.copy(peerConnection.rig.inputs.leftGamepad.position);
      rig.starts.gamepads[0].rotation.copy(peerConnection.rig.inputs.leftGamepad.quaternion);
      rig.starts.gamepads[0].pointer = peerConnection.rig.inputs.leftGamepad.pointer;
      rig.starts.gamepads[0].grip = peerConnection.rig.inputs.leftGamepad.grip;
      rig.starts.gamepads[1].position.copy(peerConnection.rig.inputs.rightGamepad.position);
      rig.starts.gamepads[1].rotation.copy(peerConnection.rig.inputs.rightGamepad.quaternion);
      rig.starts.gamepads[1].pointer = peerConnection.rig.inputs.rightGamepad.pointer;
      rig.starts.gamepads[1].grip = peerConnection.rig.inputs.rightGamepad.grip;

      rig.targets.hmd.position.fromArray(hmd.position);
      rig.targets.hmd.rotation.fromArray(hmd.quaternion);
      rig.targets.hmd.scaleFactor = hmd.scaleFactor;
      rig.targets.gamepads[0].position.fromArray(gamepads[0].position);
      rig.targets.gamepads[0].rotation.fromArray(gamepads[0].quaternion);
      rig.targets.gamepads[0].pointer = gamepads[0].pointer;
      rig.targets.gamepads[0].grip = gamepads[0].grip;
      rig.targets.gamepads[1].position.fromArray(gamepads[1].position);
      rig.targets.gamepads[1].rotation.fromArray(gamepads[1].quaternion);
      rig.targets.gamepads[1].pointer = gamepads[1].pointer;
      rig.targets.gamepads[1].grip = gamepads[1].grip;
      rig.targets.timestamp = Date.now();
    }
  });
  peerConnection.addEventListener('mediastream', e => {
    console.log('got media stream', e.detail, e.detail.getAudioTracks());
    peerConnection.mediaStream = e.detail;
    if (peerConnection.rig) {
      peerConnection.rig.setMicrophoneMediaStream(peerConnection.mediaStream, {
        muted: false,
      });
    }
  });
  peerConnection.addEventListener('message', async e => {
    console.log('got message', e);
    const data = JSON.parse(e.data);
    const {method} = data;
    if (method === 'username') {
      const {name} = data;
      peerConnection.username = name;

      if (peerConnection.rig && peerConnection.rig.nametagMesh) {
        peerConnection.rig.nametagMesh.setName(name);
      }
    } else if (method === 'model') {
      const {url} = data;
      console.log('got peer model', {url});

      if (peerConnection.rig) {
        container.remove(peerConnection.rig.model);
        peerConnection.rig.destroy();
      }

      const model = url ? await _loadModelUrl(url) : null;
      peerConnection.rig = _makeAvatar(model, {
        fingers: true,
        hair: true,
        visemes: true,
        microphoneMediaStream: peerConnection.mediaStream,
        muted: false,
        // debug: !model,
      }, peerConnection.username);

      peerConnection.rig.starts = {
        hmd: {
          position: peerConnection.rig.inputs.hmd.position.clone(),
          rotation: peerConnection.rig.inputs.hmd.quaternion.clone(),
          scaleFactor: peerConnection.rig.inputs.hmd.scaleFactor,
        },
        gamepads: [
          {
            position: peerConnection.rig.inputs.leftGamepad.position.clone(),
            rotation:  peerConnection.rig.inputs.leftGamepad.quaternion.clone(),
            pointer: peerConnection.rig.inputs.leftGamepad.pointer,
            grip: peerConnection.rig.inputs.leftGamepad.grip,
          },
          {
            position: peerConnection.rig.inputs.rightGamepad.position.clone(),
            rotation: peerConnection.rig.inputs.rightGamepad.quaternion.clone(),
            pointer: peerConnection.rig.inputs.rightGamepad.pointer,
            grip: peerConnection.rig.inputs.rightGamepad.grip,
          },
        ],
      };
      peerConnection.rig.targets = {
        hmd: {
          position: new THREE.Vector3(),
          rotation: new THREE.Quaternion(),
          scaleFactor: 1,
        },
        gamepads: [
          {
            position: new THREE.Vector3(),
            rotation: new THREE.Quaternion(),
            pointer: 0,
            grip: 0,
          },
          {
            position: new THREE.Vector3(),
            rotation: new THREE.Quaternion(),
            pointer: 0,
            grip: 0,
          },
        ],
        timestamp: Date.now(),
      };
      const heightFactor = _getHeightFactor(peerConnection.rig.height);
      peerConnection.rig.update = (_update => function update() {
        const now = Date.now();
        const {timestamp} = peerConnection.rig.targets;
        const lerpFactor = Math.min(Math.max((now - timestamp) / (peerPoseUpdateRate*2), 0), 1);

        peerConnection.rig.inputs.hmd.quaternion.copy(peerConnection.rig.starts.hmd.rotation).slerp(peerConnection.rig.targets.hmd.rotation, lerpFactor);
        peerConnection.rig.inputs.hmd.position.copy(peerConnection.rig.starts.hmd.position).lerp(
          localVector.copy(peerConnection.rig.targets.hmd.position).multiplyScalar(heightFactor),
          lerpFactor
        );
        peerConnection.rig.inputs.hmd.scaleFactor = peerConnection.rig.starts.hmd.scaleFactor * (1-lerpFactor) + peerConnection.rig.targets.hmd.scaleFactor * lerpFactor;

        peerConnection.rig.inputs.leftGamepad.position.copy(peerConnection.rig.starts.gamepads[0].position).lerp(
          localVector.copy(peerConnection.rig.targets.gamepads[0].position).multiplyScalar(heightFactor),
          lerpFactor
        );
        peerConnection.rig.inputs.leftGamepad.quaternion.copy(peerConnection.rig.starts.gamepads[0].rotation).slerp(peerConnection.rig.targets.gamepads[0].rotation, lerpFactor);
        peerConnection.rig.inputs.leftGamepad.pointer = peerConnection.rig.starts.gamepads[0].pointer * (1-lerpFactor) + peerConnection.rig.targets.gamepads[0].pointer * lerpFactor;
        peerConnection.rig.inputs.leftGamepad.grip = peerConnection.rig.starts.gamepads[0].grip * (1-lerpFactor) + peerConnection.rig.targets.gamepads[0].grip * lerpFactor;

        peerConnection.rig.inputs.rightGamepad.position.copy(peerConnection.rig.starts.gamepads[1].position).lerp(
          localVector.copy(peerConnection.rig.targets.gamepads[1].position).multiplyScalar(heightFactor),
          lerpFactor
        );
        peerConnection.rig.inputs.rightGamepad.quaternion.copy(peerConnection.rig.starts.gamepads[1].rotation).slerp(peerConnection.rig.targets.gamepads[1].rotation, lerpFactor);
        peerConnection.rig.inputs.rightGamepad.pointer = peerConnection.rig.starts.gamepads[1].pointer * (1-lerpFactor) + peerConnection.rig.targets.gamepads[1].pointer * lerpFactor;
        peerConnection.rig.inputs.rightGamepad.grip = peerConnection.rig.starts.gamepads[1].grip * (1-lerpFactor) + peerConnection.rig.targets.gamepads[1].grip * lerpFactor;

        _update.apply(this, arguments);
      })(peerConnection.rig.update);
    } else {
      console.warn('invalid method', {method});
    }
  });
}