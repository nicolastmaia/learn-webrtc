import React, {useEffect, useState, useRef} from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import JoinScreen from './pages/JoinScreen';
import IncomingCallScreen from './pages/IncomingCallScreen';
import OutgoingCallScreen from './pages/OutgoingCallScreen';
import WebrtcRoomScreen from './pages/WebrtcRoomScreen';

export default function App({wsPort}) {
  const [localStream, setlocalStream] = useState(null);

  const [remoteStream, setRemoteStream] = useState(null);

  const [type, setType] = useState('JOIN');

  const [userId] = useState(
    Math.floor(100000 + Math.random() * 900000).toString(),
  );
  const otherUserId = useRef(null);

  const wsConn = useRef(new WebSocket(`ws://192.168.1.2:${wsPort}`));

  const [localMicOn, setlocalMicOn] = useState(true);

  const [localWebcamOn, setlocalWebcamOn] = useState(true);

  const peerConnection = useRef(new RTCPeerConnection({}));

  let remoteRTCMessage = useRef(null);

  useEffect(() => {
    console.log('primeiro useeffect');
    wsConn.current.onopen = msg => {
      console.log('on open!');
      send({type: 'register', userId});
    };

    //when we get a message from a signaling server
    wsConn.current.onmessage = msg => {
      const data = JSON.parse(msg.data);
      console.log('Data --------------------->', data);

      switch (data.type) {
        //when another user is calling us
        case 'newCall':
          handleNewCall(data);
          break;

        //when somebody wants to call us
        case 'callAnswered':
          handleCallAnswered(data);
          break;

        //when a remote peer sends an ice candidate to us
        case 'ICEcandidate':
          handleICEcandidate(data);
          break;

        //when the other user rejects the call
        case 'cancelCall':
          handleCancelCall(data);

        //when the other user ends the call
        case 'endCall':
          handleEndCall(data);
          break;
      }
    };

    const handleNewCall = data => {
      console.log('\n\n\n\n INCOMING_CALL \n\n\n\n');
      remoteRTCMessage.current = data.rtcMessage;
      otherUserId.current = data.callerId;
      setType('INCOMING_CALL');
    };

    const handleCallAnswered = data => {
      console.log('\n\n\n\n CALL_ANSWERED \n\n\n\n');
      remoteRTCMessage.current = data.rtcMessage;
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(remoteRTCMessage.current),
      );
      setType('WEBRTC_ROOM');
    };

    const handleICEcandidate = data => {
      console.log('\n\n\n\n ICE_CANDIDATE \n\n\n\n');
      let message = data.rtcMessage;

      if (peerConnection.current) {
        peerConnection?.current
          .addIceCandidate(
            new RTCIceCandidate({
              candidate: message.candidate,
              sdpMid: message.id,
              sdpMLineIndex: message.label,
            }),
          )
          .then(data => {
            console.log('SUCCESS');
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    };

    const handleCancelCall = data => {
      peerConnection.current.close();
      setlocalStream(null);
      setType('JOIN');
      createPeerConnection();
    };

    const handleEndCall = data => {
      peerConnection.current.close();
      setlocalStream(null);
      setType('JOIN');
      createPeerConnection();
    };

    wsConn.current.onerror = function (err) {
      console.log('Got error', err);
    };

    createPeerConnection();
  }, []);

  useEffect(() => {
    InCallManager.start();
    InCallManager.setKeepScreenOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    return () => {
      InCallManager.stop();
    };
  }, []);

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    });

    peerConnection.current.onaddstream = event => {
      setRemoteStream(event.stream);
    };

    // Setup ice handling
    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        console.log('FOUND ICE CANDIDATE');
        send({
          type: 'ICEcandidate',
          otherUserId: otherUserId.current,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      } else {
        console.log('End of candidates.');
      }
    };

    let isFront = false;

    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind == 'videoinput' &&
          sourceInfo.facing == (isFront ? 'user' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }

      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
          },
        })
        .then(stream => {
          // Got stream!
          setlocalStream(stream);

          // setup stream listening
          peerConnection.current.addStream(stream);
        })
        .catch(error => {
          // Log error
        });
    });
  };

  const send = message => {
    console.log('Message', message);
    wsConn.current.send(JSON.stringify(message));
  };

  async function processCall() {
    setType('OUTGOING_CALL');
    const sessionDescription = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(sessionDescription);
    send({
      type: 'newCall',
      callerId: userId,
      otherUserId: otherUserId.current,
      rtcMessage: sessionDescription,
    });
  }

  async function processAccept() {
    peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(remoteRTCMessage.current),
    );
    const sessionDescription = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(sessionDescription);
    send({
      type: 'callAnswered',
      otherUserId: otherUserId.current,
      rtcMessage: sessionDescription,
    });
    setType('WEBRTC_ROOM');
  }

  async function processCancel() {
    peerConnection.current.close();
    send({
      type: 'cancelCall',
      otherUserId: otherUserId.current,
    });
    otherUserId.current = null;
    setlocalStream(null);
    createPeerConnection();
    setType('JOIN');
  }

  function switchCamera() {
    localStream.getVideoTracks().forEach(track => {
      track._switchCamera();
    });
  }

  function toggleCamera() {
    localWebcamOn ? setlocalWebcamOn(false) : setlocalWebcamOn(true);
    localStream.getVideoTracks().forEach(track => {
      localWebcamOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  function toggleMic() {
    localMicOn ? setlocalMicOn(false) : setlocalMicOn(true);
    localStream.getAudioTracks().forEach(track => {
      localMicOn ? (track.enabled = false) : (track.enabled = true);
    });
  }

  function endCall() {
    peerConnection.current.close();
    send({
      type: 'endCall',
      otherUserId: otherUserId.current,
    });
    setlocalStream(null);
    setType('JOIN');
    createPeerConnection();
  }

  const updateOtherUserId = text => {
    otherUserId.current = text;
  };

  switch (type) {
    case 'JOIN':
      return (
        <JoinScreen
          userId={userId}
          otherUserId={otherUserId.current}
          processCall={processCall}
          updateOtherUserId={updateOtherUserId}
        />
      );
    case 'INCOMING_CALL':
      return (
        <IncomingCallScreen
          otherUserId={otherUserId.current}
          processAccept={processAccept}
        />
      );
    case 'OUTGOING_CALL':
      return (
        <OutgoingCallScreen
          otherUserId={otherUserId.current}
          processCancel={processCancel}
        />
      );
    case 'WEBRTC_ROOM':
      return (
        <WebrtcRoomScreen
          localStream={localStream}
          remoteStream={remoteStream}
          localMicOn={localMicOn}
          localWebcamOn={localWebcamOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          switchCamera={switchCamera}
          endCall={endCall}
        />
      );
    default:
      return null;
  }
}
