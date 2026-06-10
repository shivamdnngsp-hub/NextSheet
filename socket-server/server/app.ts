import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const socketClientMap = new Map<string, number>();
const socketSheetMap = new Map<string, string>();



io.on("connection", (socket) => {
  console.log("Connected:", socket.id);



   socket.on("disconnect", (reason) => {
    console.log("Disconnected:", socket.id, reason);
  });

socket.on("join-sheet", ({ sheetId, clientId }) => {
  socket.join(sheetId);

  socketClientMap.set(socket.id, clientId);
  socketSheetMap.set(socket.id, sheetId);
});

  socket.on("leave-sheet", (sheetId) => {
    socket.leave(sheetId);
  });

socket.on("yjs-update", ({ sheetId, update }) => {
  socket.to(sheetId).emit("yjs-update", update);
});

socket.on("awareness-update", (update, sheetId) => {
  socket.to(sheetId).emit("awareness-update",update );
});

socket.on("disconnect", () => {
  const clientId = socketClientMap.get(socket.id);
  const sheetId = socketSheetMap.get(socket.id);

  if (clientId && sheetId) {
    socket.to(sheetId).emit("awareness-client-disconnected",clientId );
  }

  socketClientMap.delete(socket.id);
  socketSheetMap.delete(socket.id);
});


});

server.listen(5000, () => {
  console.log("Socket server running on 5000");
});