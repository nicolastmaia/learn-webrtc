type WebRTCMessage = {
  type: string;
  userId?: string;
  callerId?: string;
  otherUserId?: string;
  rtcMessage?: any;
  candidateMessage?: any;
};

export default WebRTCMessage;
