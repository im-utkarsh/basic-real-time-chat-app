import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { createServer } from "http";
import { Server } from "socket.io";

// take port from environment variables (for deployment), if not set port 3000
const port = process.env.PORT || 3000;

const httpServer = createServer();

// socket on given server, with cros
const io = new Server(httpServer, {
    cors: {
        origins: [
            "http://127.0.0.1:5500",
            "https://im-utkarsh.github.io/basic-real-time-chat-app/",
        ],
        methods: ["GET", "POST"],
    },
});

// store users
const users = {};

// Socket event handlers
//
// when new connection
io.on("connection", (socket) => {
    // get random color
    const hue = getRandomColor();
    // when new user connected
    socket.on("new-user", (name) => {
        // create avatar
        const avatar = createAvatar(botttsNeutral, {
            seed: socket.id,
            radius: 10,
            size: 50,
            backgroundColor: [`hsl(${hue}, 40%, 55%)`],
            backgroundType: ["solid"],
        });
        // if name not send, set same to socket id
        if (!name) name = socket.id;
        let obj = {
            name: name,
            avatar: avatar.toString(),
            color: hue,
        };
        users[socket.id] = obj;
        const currTime = new Date().toISOString();
        // send data to this user only
        socket.emit("i-connected", obj);
        // send alert to all users
        io.emit("new-user-connected", {
            name: name,
            color: hue,
            time: currTime,
        });
        // send updated user count to all users
        io.emit("user-count-change", Object.keys(users).length);
    });
    // when new message received
    socket.on("send-chat-message", (message) => {
        // send message to all except this user
        socket.broadcast.emit("chat-message", {
            message: message,
            user: users[socket.id],
            time: new Date().toISOString(),
        });
    });
    // when user dicsonnected
    socket.on("disconnect", () => {
        const currTime = new Date().toISOString();
        const user = users[socket.id];
        // if id not present, skip
        if (!user) return;
        // send alert to all except this user
        socket.broadcast.emit("user-disconnected", {
            name: user.name,
            color: user.color,
            time: currTime,
        });
        delete users[socket.id];
        // send upsated user count to all users
        io.emit("user-count-change", Object.keys(users).length);
    });
});

httpServer.listen(port, () => {
    console.log(`Working on ${port}`);
});

// Functions
//
// function to get random color
function getRandomColor() {
    let rn = Math.floor(Math.random() * 360);
    while (
        Object.values(users).some((itm) => Math.abs(rn - itm.color) < 15) &&
        Object.keys(users).length < 15
    )
        rn = Math.floor(Math.random() * 360);

    return rn;
}
