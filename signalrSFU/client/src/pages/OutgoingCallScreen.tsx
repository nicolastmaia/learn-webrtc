import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import CallEnd from '../components/CallEnd';

type OutgoingCallScreenProps = {
  otherUserId: string | undefined;
  processCancel: () => void;
};

const OutgoingCallScreen = ({
  otherUserId,
  processCancel,
}: OutgoingCallScreenProps) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: '#050A0E',
      }}>
      <View
        style={{
          padding: 35,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 14,
        }}>
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
          {otherUserId}
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={processCancel}
          style={{
            backgroundColor: '#FF5D5D',
            borderRadius: 30,
            height: 60,
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CallEnd width={50} height={12} fill={'#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OutgoingCallScreen;
