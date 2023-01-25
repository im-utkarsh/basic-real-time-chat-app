// const socket = io("https://basic-real-time-chat-app-production.up.railway.app");
const socket = io("http://localhost:3000");
const numUsers = document.querySelector(".num-users");
const container = document.querySelector(".container");
const avatar = document.querySelector(".avatar");
const sendContainer = document.getElementById("send-container");
const messageInput = document.querySelector(".message-input");
const submitBtn = document.querySelector(".submit");
const messageTemplate = document.querySelector(".message-template").content;
const alertTemplate = document.querySelector(".alert-template").content;

const keys = {};
let myAvatar;
let myColor = null;

const userName = prompt("Please enter your name:");

socket.emit("new-user", userName);

// appendMessage("You Joined", "middle");

socket.on("i-connected", (data) => {
    // console.log(data);
    myAvatar = data.avatar;
    // avatar.innerHTML = data.avatar;
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
    messageInput.disabled = false;
});

socket.on("chat-message", (data) => {
    appendMessage(data, "left");
});

socket.on("new-user-connected", (data) => {
    userAlert(data, "connected");
});

socket.on("user-disconnected", (name) => {
    userAlert(data, "dis-connected");
});

// socket.on("user-count-change", (num) => {
//     numUsers.innerHTML = num;
// });

function appendMessage(data, type = "left") {
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
        messageElement.querySelector(".time").innerHTML = get12Time(new Date());
    }
    container.append(messageElement);
    if (type == "right")
        container
            .querySelector(".message-container:last-child")
            .classList.add("right");
}

function userAlert(data, type = "connected") {
    let alertElement = alertTemplate.cloneNode(true);
    alertElement.querySelector(".name").innerHTML = data.name;
    alertElement.querySelector(
        ".name"
    ).style.color = `hsl(${data.color}, 75%, 35%)`;
    alertElement.querySelector(".type").innerHTML = type;
    alertElement.querySelector("span:last-child").innerHTML = data.time;
    container.append(alertElement);
    // console.log(data);
}

// function appendMessage(data, type = "left") {
//     const messageElement = document.createElement("div");
//     messageElement.innerHTML = data;
//     messageContainer.append(messageElement);
//     if (type === "right") messageElement.classList.add("you");
//     else if (type === "left") messageElement.classList.add("announce");
// }

messageInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && prevKey != "Shift") sendContainer.requestSubmit();
    prevKey = e.key;
});

submitBtn.addEventListener("click", () => sendContainer.requestSubmit());

sendContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message.length > 0) {
        // console.log(message);
        appendMessage(message, "right");
        socket.emit("send-chat-message", message);
        messageInput.value = "";
    }
});

messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = messageInput.scrollHeight + "px";
    if (messageInput.value == "\n") {
        messageInput.value = "";
        messageInput.style.height = "unset";
    }
});

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
