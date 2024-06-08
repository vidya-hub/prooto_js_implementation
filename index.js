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

// Create protoo WebSocket server
const protooWebSocketServer = new WebSocketServer(httpsServer, {
  maxReceivedFrameSize: 960000,
  maxReceivedMessageSize: 960000,
  fragmentOutgoingMessages: true,
  fragmentationThreshold: 960000,
});
protooWebSocketServer.on("connectionrequest", (info, accept, reject) => {
  const transport = accept();
  // console.log("Connection established  ", transport);
  transport.on("message", (message) => {
    console.log("Here i came", message);
    var newRoom = new Room();
    const { method, data } = message;
    if (method === "joinRoom") {
      try {
        const peer = newRoom.createPeer(data.name, transport);
        peer.notify("joined", {
          id: peer.id,
        });
      } catch (error) {
        console.log("Error  ", error);
      }
    }
  });
});

function handleGreet(socket, data) {
  socket.send(JSON.stringify(response));
}

const port = process.env.PORT || 4000;

httpsServer.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
