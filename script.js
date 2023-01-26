// variables
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

// validate username
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
            `Please Enter valid name: 
The name should have 5-20 characters, start with an alphabet and should not contain any special letter except . , _ and - .`
        );
}

// socket event handlers
//
// Send username to server whenever new user is connected
socket.emit("new-user", userName);

// show this message when success from server for this user connection
socket.on("i-connected", (data) => {
    myAvatar = data.avatar;
    document.documentElement.style.setProperty(
        "--your-color",
        `hsl(${data.color}, 80%, 40%)`
    );
    document.documentElement.style.setProperty(
        "--bg-color",
        `hsl(${data.color}, 40%, 55%)`
    );
    messageInput.disabled = false; // message can't be send till connection confirmation from server
});

// when new user connected
socket.on("new-user-connected", (data) => {
    userAlert(data, "connected");
});

// when new message received by user
socket.on("chat-message", (data) => {
    appendMessage(data, "left");
});

// when a user disconnected
socket.on("user-disconnected", (data) => {
    userAlert(data, "dis-connected");
});

// when user count in server changes
socket.on("user-count-change", (num) => {
    numUsers.innerHTML = num;
});

// Event Listeners
//
// For shift key functionality
messageInput.addEventListener("keyup", trackShiftKey);
messageInput.addEventListener("keydown", trackShiftKey);

// submit message when clicked
submitBtn.addEventListener("click", () => sendContainer.requestSubmit());

// send message when submit
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

// focus on input when clicked on message form
sendContainer.addEventListener("click", () => messageInput.focus());

// adjust height when input on text-area
messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = messageInput.scrollHeight + "px";
    if (messageInput.value == "\n") {
        messageInput.value = "";
        messageInput.style.height = "unset";
    }
});

// Functions
//
// function to append message to chat
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
        messageElement.querySelector(".time").innerHTML = get12Time(data.time);
        messageElement.querySelector(".message-body").innerHTML = data.message;
    } else {
        messageElement.querySelector(".avatar").innerHTML = myAvatar;
        messageElement.querySelector(".name").innerHTML = userName;
        messageElement.querySelector(".message-body").innerHTML = data;
        messageElement.querySelector(".time").innerHTML = get12Time();
    }
    container.append(messageElement);
    if (type == "right")
        container
            .querySelector(".message-container:last-child")
            .classList.add("right");
    window.scrollTo(0, document.body.scrollHeight);
}

// function to append user connected/disconnected alert to chat
function userAlert(data, type = "connected") {
    let alertElement = alertTemplate.cloneNode(true);
    alertElement.querySelector(".name").innerHTML = data.name;
    alertElement.querySelector(
        ".name"
    ).style.color = `hsl(${data.color}, 80%, 42%)`;
    alertElement.querySelector(".type").innerHTML = type;
    alertElement.querySelector("span:last-child").innerHTML = get12Time(
        data.time
    );
    container.append(alertElement);
    window.scrollTo(0, document.body.scrollHeight);
}

// Shift+Enter function for adding newline
function trackShiftKey(e) {
    if (e.key == "Shift") shiftPressed = !shiftPressed;

    if (e.key == "Enter" && !shiftPressed) sendContainer.requestSubmit();
}

// function to convert time to 12-hour format
function get12Time(dt = null) {
    const date = new Date(dt);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}
