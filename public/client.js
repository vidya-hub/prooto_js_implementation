const protoo = require("protoo-client");

const wsUrl = `ws://${window.location.hostname}:${window.location.port}`;

const transport = new protoo.WebSocketTransport(wsUrl);
const peer = new protoo.Peer(transport);
showToast("WebSocket connection established");

peer.on("open", () => {
  showToast("Peer connection established");
  document.getElementById("createRoomBtn").addEventListener("click", () => {
    const roomName = document.getElementById("roomName").value;
    const peerId = document.getElementById("peerId").value;
    peer
      .request("createRoom", { roomName: roomName, peerId: peerId })
      .then((response) => {
        console.log("Response from server", response);
        showToast(response);
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast(response);
      });
  });
  document.getElementById("sendBtn").addEventListener("click", () => {
    const roomName = document.getElementById("targetRoomName").value;
    const peerId = document.getElementById("targetPeerId").value;
    const message = document.getElementById("message").value;
    peer.request("messageCame", {
      roomName: roomName,
      peerId: peerId,
      message: message,
    });
  });
});

peer.on("notification", (data) => {
  console.log(data);

  switch (data.method) {
    case "roomAlreadyExists":
      showToast("Room already exists");
      break;
    case "roomCreated":
      showToast("Room created");
      break;
    case "messageCame":
      showToast(data.data);
      break;
    default:
      showToast("Unknown notification method");
      break;
  }
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

function showToast(message) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 1;
  }, 100); // Trigger transition effect
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 500); // Wait for fade out transition to complete
  }, 3000); // Display toast for 3 seconds
}
