const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

let peers = {};
let stream;

io.on('connection', async (socket) => {
  console.log(`New client connected`);
});
  // Handle join request from peer
  // socket.on('join', (peerId) => {
io.on('join', (peerId) => {
  peers[peerId] = true;
  console.log(`Client joined with ID: ${peerId}`);
});

  // Handle close connection
  // socket.on('close', () => {
io.on('close', () => {
  delete peers[socket.id];
  console.log('Client disconnected');
});


app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(16977, () => {
  console.log('Server started on port 16977');
});
