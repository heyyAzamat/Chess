import { io, type Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3001";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SERVER_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return _socket;
}

export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
}
