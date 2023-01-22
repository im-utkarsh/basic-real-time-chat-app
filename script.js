const socket = io("http://localhost:3000");
const messageContainer = document.querySelector(".message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const numUsers = document.querySelector(".num-users");

const userName = prompt("Please enter your name:");
appendMessage("You Joined", 2);

socket.on("chat-message", (data) => {
    appendMessage(`${data.name}: ${data.message}`);
});
socket.on("user-connected", (name) => appendMessage(`${name} connected`, 2));
socket.on("user-disconnected", (name) =>
    appendMessage(`${name} disconnected`, 2)
);
socket.emit("new-user", userName);
socket.on("user-count-change", (num) => {
    numUsers.innerHTML = num;
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(message, 1);
    socket.emit("send-chat-message", message);
    messageInput.value = "";
});

function appendMessage(data, myMessage = 0) {
    const messageElement = document.createElement("div");
    messageElement.innerHTML = data;
    messageContainer.append(messageElement);
    if (myMessage == 1) messageElement.classList.add("you");
    else if (myMessage == 2) messageElement.classList.add("announce");
}
