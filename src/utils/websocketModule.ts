import WebSocketServer, { WebSocket } from 'ws';
const websocketModule = new WebSocketServer.Server({ port: +process.env.WEBSOCKET_PORT });

export const WebSocketModule: {
  server: WebSocketServer.Server<WebSocketServer.WebSocket>;
  clients: Record<string, WebSocket | null>;
  addClient: (userId: string, client: WebSocket) => void;
  removeClient: (userId: string) => void;
  isClientOnline: (userId: string) => boolean;
} = {
  server: websocketModule,
  clients: {},
  addClient(userId: string, client: WebSocket) {
    this.clients[userId] = client;
  },
  removeClient(userId: string) {
    this.clients[userId] = null;
  },
  isClientOnline(userId: string) {
    return Boolean(this.clients[userId]);
  },
};
