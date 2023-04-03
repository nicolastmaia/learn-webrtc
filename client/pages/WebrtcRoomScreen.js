import React from 'react';
import {View} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import CallEnd from '../asset/CallEnd';
import MicOn from '../asset/MicOn';
import MicOff from '../asset/MicOff';
import VideoOn from '../asset/VideoOn';
import VideoOff from '../asset/VideoOff';
import CameraSwitch from '../asset/CameraSwitch';
import IconContainer from '../components/IconContainer';

const WebrtcRoomScreen = ({
  localStream,
  remoteStream,
  localMicOn,
  localWebcamOn,
  toggleMic,
  toggleCamera,
  switchCamera,
  endCall,
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#050A0E',
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}>
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
      <View
        style={{
          marginVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <IconContainer
          style={{}}
          backgroundColor={'red'}
          onPress={endCall}
          Icon={() => <CallEnd height={26} width={26} fill="#FFF" />}
        />
        <IconContainer
          style={{
            borderWidth: 1.5,
            borderColor: '#2B3034',
          }}
          backgroundColor={!localMicOn ? '#fff' : 'transparent'}
          onPress={toggleMic}
          Icon={() =>
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
          Icon={() =>
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
          Icon={() => <CameraSwitch height={24} width={24} fill="#FFF" />}
        />
      </View>
    </View>
  );
};

export default WebrtcRoomScreen;
