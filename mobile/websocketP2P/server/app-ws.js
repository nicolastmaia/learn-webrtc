const WebSocket = require('ws');

const clients = {};

function onError(ws, err) {
  console.error(`onError: ${err.message}`);
}

function onMessage(ws, data) {
  try {
    const parsedData = JSON.parse(data);

    switch (parsedData.type) {
      case 'register':
        clients[parsedData.userId] = ws;
        console.log(`${parsedData.userId} registered`);
        break;
      default:
        clients[parsedData.otherUserId]?.send(JSON.stringify(parsedData));
        break;
    }
  } catch (error) {
    console.log(data.toString());
  }
}

function onConnection(ws, req) {
  ws.on('message', (data) => onMessage(ws, data));
  ws.on('error', (error) => onError(ws, error));
  console.log(`onConnection`);
}

module.exports = (server) => {
  const wss = new WebSocket.Server({
    server,
  });

  console.log(`Websocket listening on port: ${server.address().port}`);

  wss.on('connection', onConnection);

  console.log(`App Web Socket Server is running!`);
  return wss;
};
