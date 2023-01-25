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
            color: hue,
        };
        users[socket.id] = obj;
        io.to(socket.id).emit("user-connected", obj);
        io.emit("user-count-change", Object.keys(users).length);
    });
    socket.on("send-chat-message", (message) => {
        socket.broadcast.emit("chat-message", {
            message: message,
            user: users[socket.id],
            time: get12Time(new Date()),
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

function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0"); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function get12Time(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}
