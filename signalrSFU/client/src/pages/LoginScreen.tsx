import React, { useContext, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import TextInputContainer from '../components/TextInputContainer';
import AuthContext from '../contexts/AuthContext';

const LoginScreen = (): JSX.Element => {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('1001');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: '#050A0E',
        justifyContent: 'center',
        paddingHorizontal: 42,
      }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
          <View
            style={{
              backgroundColor: '#1A1C22',
              padding: 40,
              marginTop: 25,
              justifyContent: 'center',
              borderRadius: 14,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: '#D0D4DD',
              }}>
              Username
            </Text>
            <TextInputContainer
              placeholder={'Username'}
              value={username}
              setValue={text => setUsername(text)}
              keyboardType={'default'}
            />

            <TouchableOpacity
              onPress={() => {
                login(username);
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
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
