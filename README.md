# WebRTC React Native App with Signaling
This project was born from the need of using **webrtc** in a **react-native** app while having the signaling done via **websocket**.

It is a mix of two other projects I found online:
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
