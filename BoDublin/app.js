const express = require('express');
const MediaStreamer = require('media-streamer');

const app = express();
const port = 3000;

// Set up media streamer
const mediaStreamer = new MediaStreamer();

// Create a map to store user connections
const userConnections = new Map();

// Function to handle user connection establishment
function establishConnection(userId, stream) {
  // Find an existing user connection
  const existingConnection = userConnections.get(userId);
  if (existingConnection) {
    // If a connection already exists, add the new stream to the existing connection
    existingConnection.streams.push(stream);
  } else {
    // Create a new user connection and add it to the map
    userConnections.set(userId, {
      streams: [stream],
      peers: [],
    });
  }
}

// Function to handle peer connection establishment
function establishPeerConnection(userId) {
  const userConnection = userConnections.get(userId);
  if (userConnection) {
    // Get the user's stream
    const stream = userConnection.streams[0];

    // Find an existing user connection to peer with
    for (const [id, otherUserConnection] of userConnections) {
      if (id !== userId && !otherUserConnection.peers.includes(userId)) {
        // Establish a peer connection with the other user
        const peerConnection = new RTCPeerConnection();
        peerConnection.addStream(stream);
        otherUserConnection.peers.push(userId);

        // Add the peer connection to the map
        establishConnection(id, stream);

        break;
      }
    }
  }
}

// Function to handleice candidate events
function handleIceCandidateEvent(event) {
  const userId = event.streamId;
  if (userConnections.has(userId)) {
    userConnections.get(userId).peers.push(event.peerId);
  }
}

// Set up event listeners for peer connections
const pc = new RTCPeerConnection();

pc.onicecandidate = event => {
  if (event.candidate) {
    // Send the ice candidate to other users
    const userId = userConnections.keys().next().value;
    if (userId !== 'user1') { // Do not send ice candidates from the same user
      fetch(`http://localhost:3000/ice-candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate: event.candidate }),
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
    }
  }
};

pc.onaddstream = event => {
  const userId = userConnections.keys().next().value;
  if (userId !== 'user1') { // Do not display the stream from the same user
    const videoElement = document.getElementById(`video${userId}`);
    videoElement.srcObject = event.stream;
  }
};

// Set up webcam input
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    // Establish a user connection for this user
    const userId = 'user1';
    establishConnection(userId, stream);
    establishPeerConnection(userId);

    // Create HTML elements to display video
    for (const otherUserId of userConnections.keys()) {
      if (otherUserId !== 'user1') { // Do not create the same video element from the same user
        const videoElement = document.createElement('video');
        videoElement.id = `video${otherUserId}`;
        videoElement.srcObject = null;
        document.body.appendChild(videoElement);
      }
    }

    // Create and start the peer connection
    pc.addStream(stream);
  })
  .catch(error => {
    console.error(error);
  });

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
