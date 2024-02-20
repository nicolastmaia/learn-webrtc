import React from 'react';
import { View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

import CallEnd from '../components/CallEnd';
import CameraSwitch from '../components/CameraSwitch';
import IconContainer from '../components/IconContainer';
import MicOff from '../components/MicOff';
import MicOn from '../components/MicOn';
import VideoOff from '../components/VideoOff';
import SpeakerOff from '../components/SpeakerOff';
import SpeakerOn from '../components/SpeakerOn';
import VideoOn from '../components/VideoOn';

type WebrtcRoomScreenProps = {
  localStream: any;
  remoteStream: any;
  localMicOn: boolean;
  localWebcamOn: boolean;
  speakerOn: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
  toggleSpeaker: (onOrOff?: boolean) => void;
  processEnd: () => void;
};

const WebrtcRoomScreen = ({
  localStream,
  remoteStream,
  localMicOn,
  localWebcamOn,
  speakerOn,
  toggleMic,
  toggleCamera,
  switchCamera,
  toggleSpeaker,
  processEnd,
}: WebrtcRoomScreenProps) => {
  const rtcLocalViewProps = {
    objectFit: 'cover',
    style: { flex: 1, backgroundColor: '#050A0E' },
    streamURL: localStream?.toURL(),
  };

  const rtcRemoteViewProps = {
    objectFit: 'cover',
    style: { flex: 1, backgroundColor: '#050A0E' },
    streamURL: remoteStream?.toURL(),
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#050A0E',
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}>
      {localStream ? <RTCView {...rtcLocalViewProps} /> : null}
      {remoteStream ? <RTCView {...rtcRemoteViewProps} /> : null}
      <View
        style={{
          marginVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <IconContainer
          style={{}}
          backgroundColor={'red'}
          onPress={processEnd}
          Icon={<CallEnd height={26} width={26} fill="#FFF" />}
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={!localMicOn ? '#fff' : 'transparent'}
          onPress={toggleMic}
          Icon={
            localMicOn ? (
              <MicOn height={24} width={24} fill="#FFF" />
            ) : (
              <MicOff height={28} width={28} fill="#1D2939" />
            )
          }
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={!localWebcamOn ? '#fff' : 'transparent'}
          onPress={toggleCamera}
          Icon={
            localWebcamOn ? (
              <VideoOn height={24} width={24} fill="#FFF" />
            ) : (
              <VideoOff height={36} width={36} fill="#1D2939" />
            )
          }
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={'transparent'}
          onPress={switchCamera}
          Icon={<CameraSwitch height={24} width={24} fill="#FFF" />}
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={'transparent'}
          onPress={toggleSpeaker}
          Icon={
            speakerOn ? (
              <SpeakerOn height={24} width={24} fill="#FFF" />
            ) : (
              <SpeakerOff height={28} width={28} fill="#1D2939" />
            )
          }
        />
      </View>
    </View>
  );
};

export default WebrtcRoomScreen;
