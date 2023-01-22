const io = require("socket.io")(3000, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
    },
});

const users = {};

io.on("connection", (socket) => {
    console.log("new user connected");
    socket.on("new-user", (name) => {
        users[socket.id] = name;
        socket.broadcast.emit("user-connected", name);
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