import * as signalR from '@microsoft/signalr';
import WebRTCMessage from '../types/WebRTCMessage';

class NewSignalRConnection {
  connection: any = null;

  constructor() {}

  public async createConnection(
    url: string,
    hubName: string,
    callback: () => void,
  ) {
    if (!this.connection) {
      this.connection = await new signalR.HubConnectionBuilder()
        .withUrl(`${url}/${hubName}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.startConnection(callback);
    }
  }

  startConnection(callback = () => {}) {
    Object.defineProperty(WebSocket, 'OPEN', { value: 1 });

    this.connection
      .start()
      .then(callback)
      .catch(() => {
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  onIncomingMessage(myUserSipCallId: string, name: string, callback: Function) {
    this.connection.on(name, (data: any) => {
      const parsedData: WebRTCMessage = JSON.parse(data);
      if (parsedData.otherUserId === myUserSipCallId) {
        callback(data);
      }
    });
  }

  unsubscribeMessage(name: string, callback: Function) {
    this.connection.off(name, callback);
  }

  sendMessage(name: string, message: {}) {
    this.connection.invoke(name, JSON.stringify(message));
  }
}

export default NewSignalRConnection;
