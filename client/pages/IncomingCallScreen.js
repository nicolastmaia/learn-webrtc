import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import CallAnswer from '../asset/CallAnswer';
import CallEnd from '../asset/CallEnd';

const IncomingCallScreen = ({otherUserId, processAccept, processReject}) => {
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
            fontSize: 36,
            marginTop: 12,
            color: '#ffff',
          }}>
          {otherUserId} is calling..
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          onPress={processAccept}
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

        <TouchableOpacity
          onPress={processReject}
          style={{
            backgroundColor: '#FF5D5D',
            borderRadius: 30,
            height: 60,
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <CallEnd height={28} fill={'#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IncomingCallScreen;
