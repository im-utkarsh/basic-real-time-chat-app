// const socket = io("https://basic-real-time-chat-app-production.up.railway.app");
// const socket = io("http://localhost:3000");
const messageContainer = document.querySelector(".container");
const messageForm = document.getElementById("send-container");
const messageInput = document.querySelector(".message-input");
const numUsers = document.querySelector(".num-users");
const submitBtn = document.querySelector(".submit");

const userName = prompt("Please enter your name:");
// appendMessage("You Joined", "middle");

// socket.on("chat-message", (data) => {
//     appendMessage(`${data.name}: ${data.message}`);
// });
// socket.on("user-connected", (data) => {
//     console.log(data.avatar);
//     appendMessage(`${data.name} connected`, "middle");
// });
// socket.on("user-disconnected", (name) =>
//     appendMessage(`${name} disconnected`, "middle")
// );
// socket.emit("new-user", userName);
// socket.on("user-count-change", (num) => {
//     numUsers.innerHTML = num;
// });

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(message, "right");
    socket.emit("send-chat-message", message);
    messageInput.value = "";
});

function appendMessage(data, type = "left") {
    const messageElement = document.createElement("div");
    messageElement.innerHTML = data;
    messageContainer.append(messageElement);
    if (type === "right") messageElement.classList.add("you");
    else if (type === "left") messageElement.classList.add("announce");
}

messageInput.addEventListener("input", (e) => {
    messageInput.style.height = "auto";
    messageInput.style.height = messageInput.scrollHeight + "px";
});
