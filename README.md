# WebRTC React Native App
This project was born from the need of using **webrtc** in a **react-native** app.  

I developed two versions of both the mobile app and the server so I could practice with two different technologies: 
- One that uses a **websocket** server for signaling and the audio flows from one peer to the other DIRECTLY (P2P). The server is NodeJs and the client is React-Native.
- One that uses a **signalR** server for signaling and the audio flows from one peer to the other through this same server (peer <-> server <-> peer) (SFU). The server is C#.Net 6 and and the client is React-Native.

---
The websocket project is a mix of two other projects I found online:
- One that uses socket.io for signaling and I WAS able to run; <--- [link](https://github.com/videosdk-live/webrtc/tree/main/react-native-webrtc-app)
- One that uses websocket for signaling but unfortunately I WASN'T able to run. <--- [link](https://github.com/skyrocketscommunity/React-native-webrtcApp)

Thanks [@videosdk-live](https://github.com/videosdk-live) and [@skyrocketscommunity](https://github.com/skyrocketscommunity) for making available these awesome repositories
