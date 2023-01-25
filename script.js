const socket = io("https://basic-real-time-chat-app-production.up.railway.app");
// const socket = io("http://localhost:3000");
const numUsers = document.querySelector(".num-users span");
const container = document.querySelector(".container");
const avatar = document.querySelector(".avatar");
const sendContainer = document.getElementById("send-container");
const messageInput = document.querySelector(".message-input");
const submitBtn = document.querySelector(".submit");
const messageTemplate = document.querySelector(".message-template").content;
const alertTemplate = document.querySelector(".alert-template").content;

let shiftPressed = false;
let myAvatar;
let myColor = null;
let userName = prompt("Please enter your name:");

while (true) {
    const re = /^[a-zA-Z]([a-zA-Z0-9]|([_\.-](?![_\.-])))+[a-zA-Z0-9]$/gm;
    if (
        userName &&
        re.test(userName) &&
        userName.length > 4 &&
        userName.length <= 20
    )
        break;
    else
        userName = prompt(
            "Please Enter valid name: \nThe name should have 5-20 characters, start with an alphabet and should not contain any special letter except . , _ and - ."
        );
}

if (userName == null) userName = "";

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

socket.on("user-disconnected", (data) => {
    userAlert(data, "dis-connected");
});

socket.on("user-count-change", (num) => {
    numUsers.innerHTML = num;
});

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
    window.scrollTo(0, document.body.scrollHeight);
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
    window.scrollTo(0, document.body.scrollHeight);
    // console.log(data);
}

// function appendMessage(data, type = "left") {
//     const messageElement = document.createElement("div");
//     messageElement.innerHTML = data;
//     messageContainer.append(messageElement);
//     if (type === "right") messageElement.classList.add("you");
//     else if (type === "left") messageElement.classList.add("announce");
// }

messageInput.addEventListener("keyup", trackMultipleKeys);
messageInput.addEventListener("keydown", trackMultipleKeys);

function trackMultipleKeys(e) {
    if (e.key == "Shift") shiftPressed = !shiftPressed;

    if (e.key == "Enter" && !shiftPressed) sendContainer.requestSubmit();
}

submitBtn.addEventListener("click", () => sendContainer.requestSubmit());

sendContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message.length > 0) {
        // console.log(message);
        appendMessage(message, "right");
        socket.emit("send-chat-message", message);
        messageInput.value = "";
    }
});

sendContainer.addEventListener("click", () => messageInput.focus());

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
