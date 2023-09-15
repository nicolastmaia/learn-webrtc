# WebRTC React Native App with Websocket Signaling
This project was born from the need of using **webrtc** in a **react-native** app.
In my Use Case it was also necessary to write a server that would work both as a signaling server and as a Selective Forwarding Unit (SFU) for the audio to traverse through.

I developed two versions of both the mobile app and the server to practice: 
- one that uses **websocket** for signaling and the audio flows from one peer to the other DIRECTLY. The server is NodeJs and the client is React-Native.
- one that uses **signalR** for signaling and the audio flows from one peer to the other through this server (peer <-> server <-> peer). The server is C#.Net 6 and and the client is React-Native.

The websocket project is a mix of two other projects I found online:
- one that uses socket.io for signaling and I WAS able to run; <--- [link](https://github.com/videosdk-live/webrtc/tree/main/react-native-webrtc-app)
- and one that uses websocket for signaling but unfortunately I WASN'T able to run. <--- [link](https://github.com/skyrocketscommunity/React-native-webrtcApp)

Thanks [@videosdk-live](https://github.com/videosdk-live) and [@skyrocketscommunity](https://github.com/skyrocketscommunity) for making available these awesome repositories

---
## Run the Sample App

### Server Setup

#### Step 1: Go to server folder (/server)

#### Step 2: Install Dependency

```js

npm install
```

#### Step 3: Run the project

```js

npm run start
```

---

### Client Setup

#### Step 1: Go to client folder (/client)

### Step 2: Install the dependecies

```js
npm install
```

### Step 3: Provide your local Ip address in `WebSocket`.

in App.js file, update the Network Ip address.

```js
const wsConn = useRef(new WebSocket(`ws://192.168.1.5:${wsPort}`));
```

### Step 4: Run the sample app

Bingo, it's time to push the launch button.

```js
npm run android
```
