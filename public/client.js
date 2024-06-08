const protoo = require("protoo-client");

const wsUrl = `ws://${window.location.hostname}:${window.location.port}`;

const transport = new protoo.WebSocketTransport(wsUrl);
const peer = new protoo.Peer(transport);

peer.on("open", () => {
  console.log("WebSocket connection established");

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
peer.on("notification", (message) => {
  if (message.method === "joined") {
    console.log(message);
    document.getElementById(
      "response"
    ).textContent = `joined Room:- ${message.data.id}`;
  }
});
