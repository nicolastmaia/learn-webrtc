import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

type LeaveProps = {};

const Leave = (props: LeaveProps): JSX.Element => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_226_104)" fill="#fff">
        <Path d="M3 0h11c1.7 0 3 1.3 3 3v6H8c-1.7 0-3 1.3-3 3s1.3 3 3 3h9v6c0 1.7-1.3 3-3 3H3c-1.7 0-3-1.3-3-3V3c0-1.7 1.4-3 3-3z" />
        <Path d="M20.6 13H8c-.6 0-1-.4-1-1s.4-1 1-1h12.6l-1.3-1.3c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4l-3 3c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l1.3-1.3z" />
      </G>
      <Defs>
        <ClipPath id="clip0_226_104">
          <Path fill="#fff" d="M0 0H24V24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default Leave;
