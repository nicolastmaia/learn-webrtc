import React, { ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

const buttonStyle = {
  height: 50,
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

type IconContainerProps = {
  backgroundColor: string;
  onPress: () => void;
  Icon: ReactNode;
  style: {};
};

const IconContainer = ({
  backgroundColor,
  onPress,
  Icon,
  style,
}: IconContainerProps): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        ...style,
        backgroundColor: backgroundColor ? backgroundColor : 'transparent',
        borderRadius: 30,
        height: 60,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      children={Icon}
    />
  );
};
export default IconContainer;
