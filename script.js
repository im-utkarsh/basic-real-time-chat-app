// const socket = io("https://basic-real-time-chat-app-production.up.railway.app");
const socket = io("http://localhost:3000");
const numUsers = document.querySelector(".num-users");
const container = document.querySelector(".container");
const avatar = document.querySelector(".avatar");
const sendContainer = document.getElementById("send-container");
const messageInput = document.querySelector(".message-input");
const submitBtn = document.querySelector(".submit");
const messageTemplate = document.querySelector("template").content;
let myAvatar;

let prevKey = null;
let myColor = null;

const userName = prompt("Please enter your name:");

socket.emit("new-user", userName);

// appendMessage("You Joined", "middle");

socket.on("user-connected", (data) => {
    // console.log(data);
    myAvatar = data.avatar;
    avatar.innerHTML = data.avatar;
    // avatar.querySelector("svg").style.fill = `hsl(${data.color}, 40%, 55%)`;
    document.documentElement.style.setProperty(
        "--your-color",
        `hsl(${data.color}, 80%, 40%)`
    );
    document.documentElement.style.setProperty(
        "--bg-color",
        `hsl(${data.color}, 40%, 55%)`
    );
    // appendMessage(`${data.name} connected`, "middle");
});

socket.on("chat-message", (data) => {
    appendMessage(data, "left");
});

// socket.on("user-disconnected", (name) =>
//     appendMessage(`${name} disconnected`, "middle")
// );
// socket.on("user-count-change", (num) => {
//     numUsers.innerHTML = num;
// });

sendContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    console.log(message);
    appendMessage(message, "right");
    socket.emit("send-chat-message", message);
    messageInput.value = "";
});

function appendMessage(data, type = "left") {
    const time = get12Time(new Date());
    let messageElement = messageTemplate.cloneNode(true);
    if (type == "left") {
        messageElement.querySelector(".avatar").innerHTML = data.user.avatar;
        messageElement.querySelector(
            "svg"
        ).style.fill = `hsl(${data.user.color}, 40%, 55%)`;
        messageElement.querySelector(".name").innerHTML = data.user.name;
        messageElement.querySelector(
            ".name"
        ).style.backgroundColor = `hsl(${data.user.color}, 80%, 40%)`;
        messageElement.querySelector(".time").innerHTML = data.time;
        messageElement.querySelector(".message-body").innerHTML = data.message;
    } else {
        messageElement.querySelector(".avatar").innerHTML = myAvatar;
        messageElement.querySelector(".name").innerHTML = userName;
        messageElement.querySelector(".message-body").innerHTML = data;
        messageElement.querySelector(".time").innerHTML = time;
    }
    container.append(messageElement);
    if (type == "right")
        container
            .querySelector(".message-container:last-child")
            .classList.add("right");
}

// function appendMessage(data, type = "left") {
//     const messageElement = document.createElement("div");
//     messageElement.innerHTML = data;
//     messageContainer.append(messageElement);
//     if (type === "right") messageElement.classList.add("you");
//     else if (type === "left") messageElement.classList.add("announce");
// }

messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = messageInput.scrollHeight + "px";
});

messageInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && prevKey != "Shift") sendContainer.requestSubmit();
    prevKey = e.key;
});

submitBtn.addEventListener("click", () => sendContainer.requestSubmit());

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
