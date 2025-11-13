const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require("axios");

const userRouter = require('./routes/users');
const boardRouter = require('./routes/boards');
const listRouter = require('./routes/lists');
const cardRouter = require('./routes/cards');
const messageRouter = require('./routes/messages');
const { generateObjectId } = require('./utils');

const port = 3000;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("send-message", async (msg) => {
        try {
            const res = await axios.post("http://localhost:3000/messages", {
                userId: msg.userId,
                username: msg.username,
                content: msg.content
            });

            const savedMessage = res.data.data;

            io.emit("receive-message", savedMessage);

        } catch (err) {
            console.error("Erreur lors de l’enregistrement du message :", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/users', userRouter);
app.use('/boards', boardRouter);
app.use('/lists', listRouter);
app.use('/cards', cardRouter);
app.use('/messages', messageRouter);

server.listen(port, () => {
    console.log('API + Chat server running on port', port);
});