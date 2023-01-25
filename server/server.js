import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3000;

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
    },
});

const users = {};

io.on("connection", (socket) => {
    const hue = Math.floor(Math.random() * 360);
    socket.on("new-user", (name) => {
        const avatar = createAvatar(botttsNeutral, {
            seed: socket.id,
            radius: 10,
            size: 50,
            backgroundColor: [`hsl(${hue}, 40%, 55%)`],
            backgroundType: ["solid"],
        });
        let obj = {
            name: name,
            avatar: avatar.toString(),
            color: `hsl(${hue}, 90%, 50%)`,
        };
        users[socket.id] = { obj };
        io.emit("user-connected", obj);
        io.emit("user-count-change", Object.keys(users).length);
    });
    socket.on("send-chat-message", (message) => {
        socket.broadcast.emit("chat-message", {
            message: message,
            name: users[socket.id],
        });
    });
    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", users[socket.id]);
        delete users[socket.id];
        io.emit("user-count-change", Object.keys(users).length);
    });
});

httpServer.listen(port, () => {
    console.log(`Working on ${port}`);
});
