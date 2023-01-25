import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { createServer } from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 3000;

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origins: [
            "http://127.0.0.1:5500",
            "https://im-utkarsh.github.io/basic-real-time-chat-app/",
        ],
        methods: ["GET", "POST"],
    },
});

const users = {};

io.on("connection", (socket) => {
    const hue = getRandomColor();
    socket.on("new-user", (name) => {
        const avatar = createAvatar(botttsNeutral, {
            seed: socket.id,
            radius: 10,
            size: 50,
            backgroundColor: [`hsl(${hue}, 40%, 55%)`],
            backgroundType: ["solid"],
        });
        if (!name) name = socket.id;
        let obj = {
            name: name,
            avatar: avatar.toString(),
            color: hue,
        };
        users[socket.id] = obj;
        const currTime = get12Time();
        socket.emit("i-connected", obj);
        io.emit("user-count-change", Object.keys(users).length);
        io.emit("new-user-connected", {
            name: name,
            color: hue,
            time: currTime,
        });
    });
    socket.on("send-chat-message", (message) => {
        socket.broadcast.emit("chat-message", {
            message: message,
            user: users[socket.id],
            time: get12Time(),
        });
    });
    socket.on("disconnect", () => {
        const currTime = get12Time();
        const user = users[socket.id];
        if (!user) return;
        socket.broadcast.emit("user-disconnected", {
            name: user.name,
            color: user.color,
            time: currTime,
        });
        delete users[socket.id];
        io.emit("user-count-change", Object.keys(users).length);
    });
});

httpServer.listen(port, () => {
    console.log(`Working on ${port}`);
});

function get12Time(date = new Date()) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}

function getRandomColor() {
    let rn = Math.floor(Math.random() * 360);
    while (
        Object.values(users).some((itm) => Math.abs(rn - itm.color) < 15) &&
        Object.keys(users).length < 15
    )
        rn = Math.floor(Math.random() * 360);

    return rn;
}
