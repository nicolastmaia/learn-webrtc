import React from 'react';
import { KeyboardTypeOptions, TextInput, View } from 'react-native';

type TextInputContainerProps = {
  placeholder: string;
  value: string | undefined;
  setValue: (value: string) => void;
  keyboardType: KeyboardTypeOptions | undefined;
};

const TextInputContainer = ({
  placeholder,
  value,
  setValue,
  keyboardType,
}: TextInputContainerProps): JSX.Element => {
  return (
    <View
      style={{
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202427',
        borderRadius: 12,
        marginVertical: 12,
      }}>
      <TextInput
        style={{
          margin: 8,
          padding: 8,
          width: '90%',
          textAlign: 'center',
          fontSize: 16,
          color: '#FFFFFF',
        }}
        multiline={true}
        numberOfLines={1}
        cursorColor={'#5568FE'}
        placeholder={placeholder}
        placeholderTextColor={'#9A9FA5'}
        onChangeText={setValue}
        value={value}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default TextInputContainer;
