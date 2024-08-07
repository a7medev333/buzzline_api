const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const Chat = require('./models/chat');
const { log } = require('console');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/api-chat-app',
//     //  {
//     //   useNewUrlParser: true,
//     //   useUnifiedTopology: true,
//     // }

// );
mongoose.connect("mongodb+srv://baronalsudani20:99KOaAOS8HSxUNPV@cluster0.vmixv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
// 99KOaAOS8HSxUNPV

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);



// // Socket.IO connection
io.on('connection', async (socket) => {

    // var handshakeData = socket.request;
    // console.log(handshakeData);
    console.log(`a user connected ${socket.id}`);

    socket.emit("hello", await Chat.find() );

    // socket.on('sendMessage', async ({ sender, receiver, message }) => {
    //     try {
    //         const chat = new Chat({ sender, receiver, message });
    //         await chat.save();
    //         io.to(receiver).emit('receiveMessage', chat);
    //         io.to(sender).emit('receiveMessage', chat);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // });

    // socket.on('join', ({ uuid }) => {
    //     socket.join(uuid);
    //     console.log(`User with UUID: ${uuid} joined`);
    // });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});