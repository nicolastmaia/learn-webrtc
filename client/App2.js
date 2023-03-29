import React from 'react';
import {Text, View} from 'react-native';
import App from './App';

export default function App2({}) {
  return (
    <View>
      <View>
        <App wsPort={3000} />
      </View>
      <View>
        <App wsPort={3000} />
      </View>
    </View>
  );
}
