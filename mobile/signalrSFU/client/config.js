import { HOST_IP, WS_PORT } from '@env';

const hostIp = HOST_IP;
const wsPort = WS_PORT;
const commSignalRUrl = `http://${hostIp}:${wsPort}`;

module.exports = {
  hostIp,
  wsPort,
  commSignalRUrl,
};
