import React, {useEffect, useState, useRef} from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import TextInputContainer from './components/TextInputContainer';
import SocketIOClient from 'socket.io-client';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import CallEnd from './asset/CallEnd';
import CallAnswer from './asset/CallAnswer';
import MicOn from './asset/MicOn';
import MicOff from './asset/MicOff';
import VideoOn from './asset/VideoOn';
import VideoOff from './asset/VideoOff';
import CameraSwitch from './asset/CameraSwitch';
import IconContainer from './components/IconContainer';
import InCallManager from 'react-native-incall-manager';

export default function App({wsPort}) {
  const [localStream, setlocalStream] = useState(null);

  const [remoteStream, setRemoteStream] = useState(null);

  const [type, setType] = useState('JOIN');

  const [userId] = useState(
    Math.floor(100000 + Math.random() * 900000).toString(),
  );
  const otherUserId = useRef(null);

  const wsConn = useRef(new WebSocket(`ws://192.168.1.5:${wsPort}`));

  const [localMicOn, setlocalMicOn] = useState(true);

  const [localWebcamOn, setlocalWebcamOn] = useState(true);

  const peerConnection = useRef(new RTCPeerConnection({}));

  let remoteRTCMessage = useRef(null);

  useEffect(() => {
    wsConn.current.onopen = msg => {
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
  }

  async function processCancel() {
    peerConnection.current.close();
    send({
      type: 'cancelCall',
      otherUserId: otherUserId.current,
    });
    otherUserId.current = null;
    setlocalStream(null);
    setType('JOIN');
    createPeerConnection();
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

  const JoinScreen = () => {
    return (
      <View>
        <View>
          <Text
            style={{
              fontSize: 18,
              color: '#D0D4DD',
            }}>
            Your Caller ID
          </Text>
          <View>
            <Text
              style={{
                fontSize: 32,
                color: '#000',
                letterSpacing: 6,
              }}>
              {userId}
            </Text>
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: 18,
              color: '#D0D4DD',
            }}>
            Enter call id of another user
          </Text>
          <TextInputContainer
            placeholder={'Enter Caller ID'}
            value={otherUserId.current}
            setValue={text => {
              otherUserId.current = text;
              console.log('TEST', otherUserId.current);
            }}
            keyboardType={'number-pad'}
          />
          <TouchableOpacity
            onPress={() => {
              setType('OUTGOING_CALL');
              processCall();
            }}
            style={{
              height: 50,
              backgroundColor: '#5568FE',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 12,
              marginTop: 16,
            }}>
            <Text
              style={{
                fontSize: 16,
                color: '#FFFFFF',
              }}>
              Call Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const OutgoingCallScreen = () => {
    return (
      <View>
        <View>
          <Text
            style={{
              fontSize: 16,
              color: '#D0D4DD',
            }}>
            Calling to...
          </Text>

          <Text
            style={{
              fontSize: 36,
              marginTop: 12,
              color: '#ffff',
              letterSpacing: 6,
            }}>
            {otherUserId.current}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              processCancel();
              setType('JOIN');
            }}
            style={{
              backgroundColor: '#FF5D5D',
              borderRadius: 30,
              height: 60,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CallEnd width={50} height={12} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const IncomingCallScreen = () => {
    return (
      <View>
        <View>
          <Text
            style={{
              fontSize: 36,
              marginTop: 12,
              color: '#ffff',
            }}>
            {otherUserId.current} is calling..
          </Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              processAccept();
              setType('WEBRTC_ROOM');
            }}
            style={{
              backgroundColor: 'green',
              borderRadius: 30,
              height: 60,
              aspectRatio: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CallAnswer height={28} fill={'#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const WebrtcRoomScreen = () => {
    return (
      <View>
        {localStream ? (
          <RTCView
            objectFit={'cover'}
            style={{flex: 1, backgroundColor: '#050A0E'}}
            streamURL={localStream.toURL()}
          />
        ) : null}
        {remoteStream ? (
          <RTCView
            objectFit={'cover'}
            style={{
              flex: 1,
              backgroundColor: '#050A0E',
              marginTop: 8,
            }}
            streamURL={remoteStream.toURL()}
          />
        ) : null}
        <View>
          <IconContainer
            backgroundColor={'red'}
            onPress={() => {
              endCall();
            }}
            Icon={() => {
              return <CallEnd height={26} width={26} fill="#FFF" />;
            }}
          />
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: '#2B3034',
            }}
            backgroundColor={!localMicOn ? '#fff' : 'transparent'}
            onPress={() => {
              toggleMic();
            }}
            Icon={() => {
              return localMicOn ? (
                <MicOn height={24} width={24} fill="#FFF" />
              ) : (
                <MicOff height={28} width={28} fill="#1D2939" />
              );
            }}
          />
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: '#2B3034',
            }}
            backgroundColor={!localWebcamOn ? '#fff' : 'transparent'}
            onPress={() => {
              toggleCamera();
            }}
            Icon={() => {
              return localWebcamOn ? (
                <VideoOn height={24} width={24} fill="#FFF" />
              ) : (
                <VideoOff height={36} width={36} fill="#1D2939" />
              );
            }}
          />
          <IconContainer
            style={{
              borderWidth: 1.5,
              borderColor: '#2B3034',
            }}
            backgroundColor={'transparent'}
            onPress={() => {
              switchCamera();
            }}
            Icon={() => {
              return <CameraSwitch height={24} width={24} fill="#FFF" />;
            }}
          />
        </View>
      </View>
    );
  };

  switch (type) {
    case 'JOIN':
      return JoinScreen();
    case 'INCOMING_CALL':
      return IncomingCallScreen();
    case 'OUTGOING_CALL':
      return OutgoingCallScreen();
    case 'WEBRTC_ROOM':
      return WebrtcRoomScreen();
    default:
      return null;
  }
}
