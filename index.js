import express from "express";
import fs from "fs";
import https from "httpolyglot";
import { WebSocketServer, Room } from "protoo-server";
import path from "path";

// SSL cert for HTTPS access
const options = {
  cert: "./certs/fullchain.pem",
  key: "./certs/privkey.pem",
};
const tls = {
  cert: fs.readFileSync(options.cert),
  key: fs.readFileSync(options.key),
};

const app = express();
const httpsServer = https.createServer(tls, app);

// Serve static files
app.use(express.static(path.join("./public")));

httpsServer.setTimeout(300000);
httpsServer.keepAliveTimeout = 300000;
httpsServer.headersTimeout = 320000;

// Create protoo WebSocket server
const protooWebSocketServer = new WebSocketServer(httpsServer, {
  maxReceivedFrameSize: 960000,
  maxReceivedMessageSize: 960000,
  fragmentOutgoingMessages: true,
  fragmentationThreshold: 960000,
});
const rooms = new Map();
// roomName : transport

protooWebSocketServer.on("connectionrequest", (info, accept, reject) => {
  const transport = accept();
  transport.on("message", (message) => {
    console.log("Message came here ", message);
    const { method, data } = message;
    switch (method) {
      case "createRoom":
        createRoom(data.roomName, data.peerId);
        break;
      case "messageCame":
        sendMessage(data.roomName, data.peerId, data.message);
        break;
      default:
        console.log("no method found ", method);
        break;
    }
  });

  function sendMessage(targetRoomId, targetPeerId, message) {
    if (rooms.has(targetRoomId)) {
      const peer = rooms.get(targetRoomId).getPeer(targetPeerId);
      if (peer) {
        peer.notify("messageCame", message);
      }
    } else {
      transport.send("notification", "Room not found");
    }
  }
  function createRoom(roomName, peerId) {
    if (rooms.has(roomName)) {
      const existingPeer = rooms.get(roomName).getPeer(peerId);
      existingPeer.notify("roomAlreadyExists", {
        roomName: roomName,
        peerId: peerId,
      });
      return;
    }
    var newRoom = new Room();
    const peer = newRoom.createPeer(peerId, transport);

    rooms.set(roomName, newRoom);
    console.log(rooms);
    peer.notify("roomCreated", "Room created Successfully");
  }
  transport.on("close", () => {
    console.log("Connection closed");
  });
});

const port = process.env.PORT || 4000;

httpsServer.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
