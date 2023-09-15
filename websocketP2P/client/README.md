### Step 1: Install the dependecies

```js
npm install
```

### Step 2: Provide your local Ip address in `WebSocket`.

in App.js file, update the Network Ip address.

```js
const wsConn = useRef(new WebSocket(`ws://192.168.1.5:${wsPort}`));
```

### Step 3: Run the sample app

```js
npm run android
```
