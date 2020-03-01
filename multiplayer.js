const firebaseConfig = {
  apiKey: "AIzaSyD7apT7b9ZN_qKk_VN3KEkX8lNshstw77s",
  authDomain: "cryptopolys-d165e.firebaseapp.com",
  databaseURL: "https://cryptopolys-d165e.firebaseio.com",
  projectId: "cryptopolys-d165e",
  storageBucket: "cryptopolys-d165e.appspot.com",
  messagingSenderId: "890193315224",
  appId: "1:890193315224:web:8fac7fd371d8b9682217ed",
  measurementId: "G-8K7DF12HSQ",
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const defaultIceServers = [
  {'urls': 'stun:stun.stunprotocol.org:3478'},
  {'urls': 'stun:stun.l.google.com:19302'},
];

/* function _randomString() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
} */
const roomAlphabetStartIndex = 'A'.charCodeAt(0);
const roomAlphabetEndIndex = 'Z'.charCodeAt(0)+1;
const roomIdLength = 4;
function makeId() {
  let result = '';
  for (let i = 0; i < roomIdLength; i++) {
    result += String.fromCharCode(roomAlphabetStartIndex + Math.floor(Math.random() * (roomAlphabetEndIndex - roomAlphabetStartIndex)));
  }
  return result;
}

class DbSocket extends EventTarget {
  constructor(roomId, connectionId) {
    super();

    this.roomId = roomId;
    this.connectionId = connectionId;
    this.cleanup = null;

    const _bindEvent = eventName => {
      const handlerName = 'on' + eventName;
      this[handlerName] = null;

      this.addEventListener(eventName, e => {
        const handler = this[handlerName];
        handler && handler(e);
      });
    };
    _bindEvent('open');
    _bindEvent('close');
    _bindEvent('message');
    _bindEvent('error');

    this.connect();
  }
  connect() {
    const roomRef = database.ref('connections/' + this.roomId);
    const _childAdded = e => {
      const v = e.val();
      if (v) {
        const _handleData = data => {
          const {src, dst} = data;
          if (src !== this.connectionId && (!dst || dst === this.connectionId)) {
            this.dispatchEvent(new MessageEvent('message', {
              data,
            }));
            e.ref.remove();
          }
        };
        if (typeof v === 'string') {
          const data = JSON.parse(v);
          _handleData(data);
        } else {
          for (const k in v) {
            const data = JSON.parse(v[k]);
            _handleData(data);
          }
        }
      }
    };
    roomRef.once('value', _childAdded);
    roomRef.on('child_added', _childAdded);
    this.cleanup = () => roomRef.off('child_added', _childAdded);

    Promise.resolve().then(() => {
      this.dispatchEvent(new CustomEvent('open'));
    });
  }
  close() {
    this.cleanup();
    this.cleanup = null;

    this.dispatchEvent(new CustomEvent('close'));
  }
  async send(data) {
    const roomRef = database.ref('connections/' + this.roomId);
    roomRef.remove();
    await roomRef.push().set(JSON.stringify(data));
  }
}

class XRChannelConnection extends EventTarget {
  constructor(roomId = makeId(), options = {}) {
    super();

    const connectionId = makeId();
    this.connectionId = connectionId;
    this.rtcWs = new DbSocket(roomId, connectionId);
    this.peerConnections = [];
    this.microphoneMediaStream = options.microphoneMediaStream;
    this.pollInterval = 0;

    this.rtcWs.onopen = () => {
      // console.log('presence socket open');

      const _sendJoin = () => this.rtcWs.send({
        method: 'join',
        src: this.connectionId,
      });

      let polling = false;
      this.pollInterval = setInterval(async () => {
        if (!polling) {
          polling = true;

          await _sendJoin();
          /* const res = await fetch(`${this.endpointUrl}/poll?roomId=${this.roomId}&dstId=${this.connectionId}`, {
            method: 'POST',
          });
          if (res.ok) {
            const messages = await res.json();
            console.log('got messages', messages);
            for (let i = 0; i < messages.length; i++) {
              const message = messages[i];
              let {srcId, data} = message;
              data = JSON.parse(data);
              this.dispatchEvent(new CustomEvent('message', {
                detail: {
                  srcId,
                  data,
                },
              }));
            }
          } */

          polling = false;
        }
      }, 1000);

      this.dispatchEvent(new CustomEvent('open'));
    };
    const _addPeerConnection = peerConnectionId => {
      let peerConnection = this.peerConnections.find(peerConnection => peerConnection.connectionId === peerConnectionId);
      /* if (peerConnection && !peerConnection.open) {
        peerConnection.close();
        peerConnection = null;
      } */
      if (!peerConnection) {
        peerConnection = new XRPeerConnection(peerConnectionId);
        peerConnection.token = this.connectionId < peerConnectionId ? -1 : 0;
        peerConnection.needsNegotiation = false;
        peerConnection.negotiating = false;
        peerConnection.peerConnection.onnegotiationneeded = e => {
          console.log('negotiation needed', peerConnection.token, peerConnection.negotiating);
          if (peerConnection.token !== 0 && !peerConnection.negotiating) {
            if (peerConnection.token !== -1) {
              clearTimeout(peerConnection.token);
              peerConnection.token = -1;
            }
            peerConnection.needsNegotiation = false;
            peerConnection.negotiating = true;

            _startOffer(peerConnection);
          } else {
            peerConnection.needsNegotiation = true;
          }
        };
        peerConnection.peerConnection.onicecandidate = e => {
          // console.log('ice candidate', e.candidate);

          this.rtcWs.send({
            dst: peerConnectionId,
            src: this.connectionId,
            method: 'iceCandidate',
            candidate: e.candidate,
          });
        };
        peerConnection.onclose = () => {
          const index = this.peerConnections.indexOf(peerConnection);
          if (index !== -1) {
            this.peerConnections.splice(index, 1);
          }
        };

        this.peerConnections.push(peerConnection);
        this.dispatchEvent(new CustomEvent('peerconnection', {
          detail: peerConnection,
        }));

        if (this.microphoneMediaStream) {
          // peerConnection.peerConnection.addStream(this.microphoneMediaStream);
          const tracks = this.microphoneMediaStream.getAudioTracks();
          for (let i = 0; i < tracks.length; i++) {
            // console.log('add track for remote', tracks[i]);
            peerConnection.peerConnection.addTrack(tracks[i]);
          }
        }
      }
    };
    const _removePeerConnection = peerConnectionId => {
      const index = this.peerConnections.findIndex(peerConnection => peerConnection.connectionId === peerConnectionId);
      if (index !== -1) {
        this.peerConnections.splice(index, 1)[0].close();
      } else {
        console.warn('no such peer connection', peerConnectionId, this.peerConnections.map(peerConnection => peerConnection.connectionId));
      }
    };
    const _startOffer = peerConnection => {
      peerConnection.peerConnection
        .createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        .then(offer => {
          // console.log('create offer');
          return peerConnection.peerConnection.setLocalDescription(offer).then(() => offer);
        })
        .then(offer => {
          this.rtcWs.send({
            dst: peerConnection.connectionId,
            src: this.connectionId,
            method: 'offer',
            offer,
          });
        });
    };
    this.rtcWs.onmessage = e => {
      // console.log('got message', e.data);

      const {data} = e;
      const {method} = data;
      if (method === 'join') {
        const {src: peerConnectionId} = data;
        _addPeerConnection(peerConnectionId);
      } else if (method === 'offer') {
        const {src: peerConnectionId, offer} = data;

        let peerConnection = this.peerConnections.find(peerConnection => peerConnection.connectionId === peerConnectionId);
        if (!peerConnection) {
          _addPeerConnection(peerConnectionId);
          peerConnection = this.peerConnections.find(peerConnection => peerConnection.connectionId === peerConnectionId);
        }
        peerConnection.peerConnection.setRemoteDescription(offer)
          .then(() => {
            // console.log('create answer');
            return peerConnection.peerConnection.createAnswer();
          })
          .then(answer => peerConnection.peerConnection.setLocalDescription(answer).then(() => answer))
          .then(answer => {
            this.rtcWs.send({
              dst: peerConnectionId,
              src: this.connectionId,
              method: 'answer',
              answer,
            });
          }).then(() => new Promise((accept, reject) => {
            const _recurse = () => {
              if (peerConnection.peerConnection.signalingState === 'stable') {
                accept();
              } else {
                peerConnection.peerConnection.addEventListener('signalingstatechange', _recurse, {
                  once: true,
                });
              }
            };
            _recurse();
          }));
      } else if (method === 'answer') {
        const {src: peerConnectionId, answer} = data;

        const peerConnection = this.peerConnections.find(peerConnection => peerConnection.connectionId === peerConnectionId);
        if (peerConnection) {
          peerConnection.peerConnection.setRemoteDescription(answer)
            .then(() => {
              peerConnection.negotiating = false;
              peerConnection.token = 0;

              this.rtcWs.send({
                dst: peerConnectionId,
                src: this.connectionId,
                method: 'token',
              });
            });
        } else {
          console.warn('answer for no such peer connection', peerConnectionId, this.peerConnections.map(peerConnection => peerConnection.connectionId));
        }
      } else if (method === 'iceCandidate') {
        const {src: peerConnectionId, candidate} = data;

        const peerConnection = this.peerConnections.find(peerConnection => peerConnection.connectionId === peerConnectionId);
        if (peerConnection) {
          peerConnection.peerConnection.addIceCandidate(candidate)
            .catch(err => {
              // console.warn(err);
            });
        } else {
          console.warn('no such peer connection', peerConnectionId, this.peerConnections.map(peerConnection => peerConnection.connectionId));
        }
      } else if (method === 'token') {
        const {src: peerConnectionId} = data;

        const peerConnection = this.peerConnections.find(peerConnection => peerConnection.connectionId === peerConnectionId);
        if (peerConnection) {
          if (peerConnection.needsNegotiation) {
            peerConnection.token = -1;
            peerConnection.needsNegotiation = false;
            peerConnection.negotiating = true;

            _startOffer(peerConnection);
          } else {
            peerConnection.token = setTimeout(() => {
              peerConnection.token = 0;

              this.rtcWs.send({
                dst: peerConnectionId,
                src: this.connectionId,
                method: 'token',
              });
            }, 500);
          }
        } else {
          console.warn('no such peer connection', peerConnectionId, this.peerConnections.map(peerConnection => peerConnection.connectionId));
        }
      } else if (method === 'leave') {
        const {src: peerConnectionId} = data;
        _removePeerConnection(peerConnectionId);
      } else {
        this.dispatchEvent(new MessageEvent('message', {
          data: e.data,
        }));
      }
    };
    this.rtcWs.onclose = () => {
      clearInterval(this.pollInterval);
      console.log('rtc ws got close');

      this.dispatchEvent(new CustomEvent('close'));
    };
    this.rtcWs.onerror = err => {
      console.warn('rtc error', err);
      clearInterval(this.pollInterval);

      this.dispatchEvent(new ErrorEvent('error', {
        message: err.stack,
      }));
    };
  }

  disconnect() {
    this.rtcWs.send({
      src: this.connectionId,
      method: 'leave',
    });
    this.rtcWs.close();
    this.rtcWs = null;

    for (let i = 0; i < this.peerConnections[i]; i++) {
      this.peerConnections[i].close();
    }
    this.peerConnections.length = 0;
  }

  /* send(s) {
    this.rtcWs.send(s);
  } */

  update(hmd, gamepads) {
    for (let i = 0; i < this.peerConnections.length; i++) {
      const peerConnection = this.peerConnections[i];
      if (peerConnection.open) {
        peerConnection.update(hmd, gamepads);
      }
    }
  }

  setMicrophoneMediaStream(microphoneMediaStream) {
    const {microphoneMediaStream: oldMicrophoneMediaStream} = this;
    if (oldMicrophoneMediaStream) {
      const oldTracks = oldMicrophoneMediaStream.getAudioTracks();
      for (let i = 0; i < this.peerConnections.length; i++) {
        const peerConnection = this.peerConnections[i];
        const senders = peerConnection.peerConnection.getSenders();
        const oldTrackSenders = oldTracks.map(track => senders.find(sender => sender.track === track));
        for (let j = 0; j < oldTrackSenders.length; j++) {
          peerConnection.peerConnection.removeTrack(oldTrackSenders[j]);
        }
      }
    }

    this.microphoneMediaStream = microphoneMediaStream;

    if (microphoneMediaStream) {
      const tracks = microphoneMediaStream.getAudioTracks();
      for (let i = 0; i < this.peerConnections.length; i++) {
        const peerConnection = this.peerConnections[i];
        for (let j = 0; j < tracks.length; j++) {
          peerConnection.peerConnection.addTrack(tracks[j]);
        }
      }
    }
  }
}

class XRPeerConnection extends EventTarget {
  constructor(peerConnectionId) {
    super();

    this.connectionId = peerConnectionId;

    this.peerConnection = new RTCPeerConnection({
      iceServers: defaultIceServers,
    });
    this.open = false;

    /* this.peerConnection.onaddstream = e => {
      this.dispatchEvent(new CustomEvent('mediastream', {
        detail: e.stream,
      }));
    }; */
    this.peerConnection.ontrack = e => {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(e.track);
      this.dispatchEvent(new CustomEvent('mediastream', {
        detail: mediaStream,
      }));
    };

    const sendChannel = this.peerConnection.createDataChannel('sendChannel');
    this.peerConnection.sendChannel = sendChannel;
    let pingInterval = 0;
    sendChannel.onopen = () => {
      // console.log('data channel local open');

      this.open = true;
      this.dispatchEvent(new CustomEvent('open'));

      /* pingInterval = setInterval(() => {
        sendChannel.send(JSON.stringify({
          method: 'ping',
        }));
      }, 1000); */
    };
    sendChannel.onclose = () => {
      console.log('send channel got close');

      _cleanup();
    };
    sendChannel.onerror = err => {
      // console.log('data channel local error', err);
    };
    /* let watchdogTimeout = 0;
    const _kick = () => {
      if (watchdogTimeout) {
        clearTimeout(watchdogTimeout);
        watchdogTimeout = 0;
      }
      watchdogTimeout = setTimeout(() => {
        this.peerConnection.close();
      }, 5000);
    };
    _kick(); */
    this.peerConnection.ondatachannel = e => {
      const {channel} = e;
      // console.log('data channel remote open', channel);
      channel.onclose = () => {
        // console.log('data channel remote close');
        this.peerConnection.close();
      };
      channel.onerror = err => {
        // console.log('data channel remote error', err);
      };
      channel.onmessage = e => {
        // console.log('data channel message', e.data);

        const data = JSON.parse(e.data);
        const {method} = data;
        if (method === 'pose') {
          this.dispatchEvent(new CustomEvent('pose', {
            detail: data,
          }))
        /* } else if (method === 'ping') {
          // nothing */
        } else {
          this.dispatchEvent(new MessageEvent('message', {
            data: e.data,
          }));
        }

        // _kick();
      };
      this.peerConnection.recvChannel = channel;
    };
    this.peerConnection.close = (close => function() {
      _cleanup();

      return close.apply(this, arguments);
    })(this.peerConnection.close);
    const _cleanup = () => {
      if (this.open) {
        this.open = false;
        this.dispatchEvent(new CustomEvent('close'));
      }
      if (this.token !== -1) {
        clearTimeout(this.token);
        this.token = -1;
      }
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = 0;
      }
    };
  }

  close() {
    this.peerConnection.close();
  }

  send(s) {
    this.peerConnection.sendChannel.send(s);
  }

  update(hmd, gamepads) {
    this.send(JSON.stringify({
      method: 'pose',
      hmd,
      gamepads,
    }));
  }
}

export {
  makeId,
  // DbSocket,
  XRChannelConnection,
  XRPeerConnection,
};