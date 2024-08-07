const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./models/chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});