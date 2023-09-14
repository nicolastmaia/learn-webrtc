import React, { useContext, useEffect, useRef, useState } from 'react';
import 'react-native-get-random-values';
import InCallManager from 'react-native-incall-manager';
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';

import AuthContext from '../contexts/AuthContext';
import WebRTCMessage from '../types/WebRTCMessage';
import IncomingCallScreen from './IncomingCallScreen';
import JoinScreen from './JoinScreen';
import OutgoingCallScreen from './OutgoingCallScreen';
import WebrtcRoomScreen from './WebrtcRoomScreen';
import NewSignalRConnection from '../components/NewSignalRConnection';

const { commSignalRUrl } = require('../../config');

const hubName = 'customHub';

export default function LoggedInScreen() {
  const { loggedInUserName } = useContext(AuthContext);

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [type, setType] = useState<string>('JOIN');
  const [localMicOn, setLocalMicOn] = useState<boolean>(true);
  const [localWebcamOn, setLocalWebcamOn] = useState<boolean>(true);
  const [speakerOn, setSpeakerOn] = useState<boolean>(false);

  const otherUserId = useRef<string | undefined>('');

  const subscriptionInterval = useRef<any>(null);
  const commSignalRConnection = useRef<NewSignalRConnection | null>(null);

  let remoteRTCMessage = useRef<RTCSessionDescription>(
    new RTCSessionDescription(),
  );

  const peerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection({}));

  // SignalR connection useEffect
  useEffect(() => {
    createPeerConnection();

    if (commSignalRConnection.current === null) {
      createCommSignalRConnection();
    }
  }, []);

  const createCommSignalRConnection = () => {
    const handleNewCall = (data: WebRTCMessage): void => {
      remoteRTCMessage.current = new RTCSessionDescription(data.rtcMessage);
      peerConnection.current.setRemoteDescription(remoteRTCMessage.current);
      otherUserId.current = data.callerId;
      InCallManager.start({ media: 'audio', ringback: '_BUNDLE_' }); // or _DEFAULT_ or _DTMF_
      setType('INCOMING_CALL');
    };

    const handleWakeUpCall = (data: WebRTCMessage): void => {
      otherUserId.current = data.callerId;
      InCallManager.start({ media: 'audio', ringback: '_BUNDLE_' }); // or _DEFAULT_ or _DTMF_
      setType('INCOMING_CALL');
    };

    const handleAcceptCall = (data: WebRTCMessage): void => {
      const sessionDescription = data.rtcMessage;
      remoteRTCMessage.current = new RTCSessionDescription(sessionDescription);
      peerConnection.current.setRemoteDescription(remoteRTCMessage.current);

      InCallManager.stopRingback();
      setType('WEBRTC_ROOM');
    };

    const handleICEcandidate = (data: WebRTCMessage): void => {
      let message: any = data.candidateMessage;

      if (peerConnection.current) {
        peerConnection?.current
          .addIceCandidate(
            new RTCIceCandidate({
              candidate: 'candidate:' + message.candidate,
              sdpMid: 'audio',
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

    const handleCancelCall = () => {
      hangUp();
      createPeerConnection();
    };

    const handleRejectCall = () => {
      hangUp();
      createPeerConnection();
    };

    const handleEndCall = () => {
      hangUp();
      createPeerConnection();
    };

    commSignalRConnection.current = new NewSignalRConnection();

    commSignalRConnection.current.createConnection(
      commSignalRUrl,
      hubName,
      () => {
        if (commSignalRConnection.current) {
          commSignalRConnection.current.sendMessage('register', {
            type: 'register',
            userId: loggedInUserName,
          });

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'newCall',
            (data: any) => {
              const parsedData = JSON.parse(data);

              handleNewCall(parsedData);
            },
          );

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'wakeUpCall',
            (data: any) => {
              const parsedData = JSON.parse(data);

              handleWakeUpCall(parsedData);
            },
          );

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'acceptCall',
            (data: any) => {
              const parsedData = JSON.parse(data);
              handleAcceptCall(parsedData);
            },
          );

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'ICEcandidate',
            (data: any) => {
              const parsedData = JSON.parse(data);
              handleICEcandidate(parsedData);
            },
          );

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'cancelCall',
            handleCancelCall,
          );

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'rejectCall',
            handleRejectCall,
          );

          commSignalRConnection.current.onIncomingMessage(
            loggedInUserName,
            'endCall',
            handleEndCall,
          );
        }
      },
    );
  };

  const createPeerConnection = () => {
    let config = {};

    // config = {
    //   iceServers: [
    //     {
    //       urls: 'stun:yourserver.net.br', // stun URL here
    //     },
    //     {
    //       urls: 'turn:yourserver.net.br', // turn URL here
    //
    //       // turn credentials below
    //       username: '',
    //       credentialType: 'password',
    //       credential: '',
    //     },
    //   ],
    // };

    peerConnection.current = new RTCPeerConnection(config);

    peerConnection.current.onaddstream = (event: any) => {
      setRemoteStream(event.stream);
    };

    // Setup ice handling
    peerConnection.current.onicecandidate = (event: any) => {
      if (event.candidate) {
        const message = {
          type: 'ICEcandidate',
          userId: loggedInUserName,
          callerId: '',
          otherUserId: otherUserId.current,
          candidateMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        };
        if (commSignalRConnection.current)
          commSignalRConnection.current.sendMessage('ICEcandidate', message);
      }
    };

    let isFront = false;

    mediaDevices.enumerateDevices().then((sourceInfos: any) => {
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
            optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
          },
        })
        .then(stream => {
          // Got stream!
          setLocalStream(stream);

          // setup stream listening
          peerConnection.current.addStream(stream);
        })
        .catch(error => {
          // Log error
        });
    });
  };

  const processCall = async () => {
    try {
      const sessionDescription: any = await peerConnection.current.createOffer(
        {},
      );

      let fingerprint = sessionDescription.sdp.substr(398, 103);

      let stats = await peerConnection.current.getStats();
      stats.forEach((item: any) => console.log(item));

      let s: { sdp: string; type: null } = { sdp: '', type: null };
      s.sdp = `v=0\r\no=- 4898524163085081970 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS b9a2d683-0c6c-43c9-9ba2-d5ee692fff2f\r\nm=audio 9 UDP/TLS/RTP/SAVPF 0\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:rfft\r\na=ice-pwd:wIpPnXURQwwCLZGrhlOiuHJJ\r\na=ice-options:trickle renomination\r\na=fingerprint:${fingerprint}\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:0 PCMU/8000\r\na=ssrc:2182425242 cname:fyOmwyLjg+eQ+Kdj\r\na=ssrc:2182425242 msid:b9a2d683-0c6c-43c9-9ba2-d5ee692fff2f 828667a4-03f3-4e02-8f20-6d9ab006d448\r\nm=video 9 UDP/TLS/RTP/SAVPF 96 97 98 99 35 36 125 124 127\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:rfft\r\na=ice-pwd:wIpPnXURQwwCLZGrhlOiuHJJ\r\na=ice-options:trickle renomination\r\na=fingerprint:${fingerprint}\r\na=setup:actpass\r\na=mid:video\r\na=extmap:14 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:13 urn:3gpp:video-orientation\r\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\r\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\r\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\r\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96\r\na=rtpmap:98 VP9/90000\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98\r\na=rtpmap:35 AV1/90000\r\na=rtcp-fb:35 goog-remb\r\na=rtcp-fb:35 transport-cc\r\na=rtcp-fb:35 ccm fir\r\na=rtcp-fb:35 nack\r\na=rtcp-fb:35 nack pli\r\na=rtpmap:36 rtx/90000\r\na=fmtp:36 apt=35\r\na=rtpmap:125 red/90000\r\na=rtpmap:124 rtx/90000\r\na=fmtp:124 apt=125\r\na=rtpmap:127 ulpfec/90000\r\na=ssrc-group:FID 1490247767 2214070248\r\na=ssrc:1490247767 cname:fyOmwyLjg+eQ+Kdj\r\na=ssrc:1490247767 msid:b9a2d683-0c6c-43c9-9ba2-d5ee692fff2f f3a4d559-dee7-4e00-846c-d515234edb6e\r\na=ssrc:2214070248 cname:fyOmwyLjg+eQ+Kdj\r\na=ssrc:2214070248 msid:b9a2d683-0c6c-43c9-9ba2-d5ee692fff2f f3a4d559-dee7-4e00-846c-d515234edb6e\r\n`;

      let desc = new RTCSessionDescription(s);

      desc._type = 'offer';

      let desc2 = sessionDescription;

      await peerConnection.current.setLocalDescription(desc2);

      const message: WebRTCMessage = {
        type: 'newCall',
        userId: loggedInUserName,
        callerId: loggedInUserName,
        otherUserId: otherUserId.current,
        rtcMessage: desc2,
      };

      if (commSignalRConnection.current)
        commSignalRConnection.current.sendMessage('newCall', message);

      InCallManager.start({ media: 'audio', ringback: '_DTMF_' }); // or _DEFAULT_ or _DTMF_
      setType('OUTGOING_CALL');
    } catch (error) {
      console.log('----------------------' + error);
    }
  };

  const processWakeUp = async () => {
    try {
      const sessionDescription: any = await peerConnection.current.createOffer(
        {},
      );
      await peerConnection.current.setLocalDescription(sessionDescription);

      const message: WebRTCMessage = {
        type: 'acceptCall',
        userId: loggedInUserName,
        callerId: loggedInUserName,
        otherUserId: otherUserId.current,
        rtcMessage: sessionDescription,
      };

      if (commSignalRConnection.current)
        commSignalRConnection.current.sendMessage('acceptCall', message);

      InCallManager.stopRingback();
      setType('WEBRTC_ROOM');
    } catch (error) {
      console.log(error);
    }
  };

  const processAccept = async () => {
    try {
      const sessionDescription: any =
        await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(sessionDescription);

      const message: WebRTCMessage = {
        type: 'acceptCall',
        userId: loggedInUserName,
        callerId: '',
        otherUserId: otherUserId.current,
        rtcMessage: sessionDescription,
      };

      if (commSignalRConnection.current)
        commSignalRConnection.current.sendMessage('acceptCall', message);

      InCallManager.stopRingback();
      setType('WEBRTC_ROOM');
    } catch (error) {
      console.log(error);
    }
  };

  const processCancel = () => {
    const message: WebRTCMessage = {
      type: 'cancelCall',
      userId: loggedInUserName,
      otherUserId: otherUserId.current,
      callerId: '',
      rtcMessage: undefined,
    };

    if (commSignalRConnection.current)
      commSignalRConnection.current.sendMessage('cancelCall', message);

    hangUp();
    createPeerConnection();
  };

  const processReject = () => {
    const message: WebRTCMessage = {
      type: 'rejectCall',
      userId: loggedInUserName,
      otherUserId: otherUserId.current,
      callerId: '',
      rtcMessage: undefined,
    };

    if (commSignalRConnection.current)
      commSignalRConnection.current.sendMessage('rejectCall', message);

    hangUp();
    createPeerConnection();
  };

  const processEnd = () => {
    const message: WebRTCMessage = {
      type: 'endCall',
      userId: loggedInUserName,
      otherUserId: otherUserId.current,
      callerId: '',
      rtcMessage: undefined,
    };

    if (commSignalRConnection.current)
      commSignalRConnection.current.sendMessage('endCall', message);

    hangUp();
    createPeerConnection();
  };

  const hangUp = () => {
    if (peerConnection.current) peerConnection.current.close();

    InCallManager.stopRingback();
    InCallManager.stop();

    setType('JOIN');
    otherUserId.current = '';
    setLocalStream(null);
    setRemoteStream(null);
    setLocalMicOn(true);
    setLocalWebcamOn(true);
  };

  const switchCamera = () => {
    localStream.getVideoTracks().forEach((track: any) => {
      track._switchCamera();
    });
  };

  const toggleCamera = () => {
    localWebcamOn ? setLocalWebcamOn(false) : setLocalWebcamOn(true);
    localStream.getVideoTracks().forEach((track: any) => {
      localWebcamOn ? (track.enabled = false) : (track.enabled = true);
    });
  };

  const toggleMic = () => {
    localMicOn ? setLocalMicOn(false) : setLocalMicOn(true);
    localStream.getAudioTracks().forEach((track: any) => {
      localMicOn ? (track.enabled = false) : (track.enabled = true);
    });
  };

  const toggleSpeaker = () => {
    InCallManager.setSpeakerphoneOn(!speakerOn);
    setSpeakerOn(value => !value);
  };

  const updateOtherUserId = (text: string): void => {
    otherUserId.current = text;
  };

  const endCommSignalRConnection = () => {
    clearInterval(subscriptionInterval.current);

    commSignalRConnection.current = null;
  };

  switch (type) {
    case 'JOIN':
      return (
        <JoinScreen
          processCall={processCall}
          updateOtherUserId={updateOtherUserId}
          endCommSignalRConnection={endCommSignalRConnection}
        />
      );
    case 'INCOMING_CALL':
      return (
        <IncomingCallScreen
          otherUserId={otherUserId.current}
          processAccept={processAccept}
          processWakeUp={processWakeUp}
          processReject={processReject}
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
          speakerOn={speakerOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          switchCamera={switchCamera}
          toggleSpeaker={toggleSpeaker}
          processEnd={processEnd}
        />
      );
    default:
      return null;
  }
}
