import * as React from 'react';
import Svg, {
  ClipPath,
  Defs,
  G,
  Linecap,
  Linejoin,
  Path,
  StrokeProps,
} from 'react-native-svg';

type SpeakerOffProps = {
  height: number;
  width: number;
  fill: string;
};

const SpeakerOff = (props: SpeakerOffProps): JSX.Element => {
  return (
    <Svg viewBox="0 0 75 75" {...props}>
      <G clipPath="url(#a)">
        <Path
          d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
          stroke="#fff"
          strokeWidth={5}
          strokeLinejoin="round"
          fill="#fff"
        />
        <Path
          d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
          stroke={props.fill}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
};

export default SpeakerOff;
