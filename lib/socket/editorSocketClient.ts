import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectEditorSocket = (projectId: string): Socket => {
  socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/editor`, {
    withCredentials: true,
    query: { projectId },
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection failed:", err.message);
  });

  return socket;
};

export const getEditorSocket = (): Socket | undefined => socket;