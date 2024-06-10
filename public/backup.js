const protoo = require("protoo-client");

const wsUrl = `ws://${window.location.hostname}:${window.location.port}`;

const transport = new protoo.WebSocketTransport(wsUrl);
const peer = new protoo.Peer(transport);

peer.on("open", () => {
  document.getElementById("greetButton").addEventListener("click", () => {
    const name = document.getElementById("nameInput").value;
    peer.request("joinRoom", { name });
  });
});

peer.on("failed", () => {
  console.log("WebSocket connection failed");
});

peer.on("disconnected", () => {
  console.log("WebSocket disconnected");
});

peer.on("close", () => {
  console.log("WebSocket closed");
});
peer.on("notification", (notification) => {
  if (notification.method === "joined") {
    console.log(notification);
  }
});
// document.getElementById("messageButton").addEventListener("click", () => {
//   const message = document.getElementById("messageInput").value;
//   peer.request("joinRoom", { name: message });
// });
