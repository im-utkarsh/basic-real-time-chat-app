# 💬 Real-Time Chat App
A real time chat app with single global room where anyone can connect and chat. Current online users are also shown on the top right corner.  
The app is build using [socket.io](https://socket.io/) library.  

[Live Demo](https://im-utkarsh.github.io/basic-real-time-chat-app/)  

## 🧩Components
* `index.html` contains basic html elements and templates required.
* `style.css` contains styling related to html elements.
* `script.js` is the main javascript file for frontend.
* `/Server` contains server side files required.
* `server.js` is the main server side file. This file uses http, socket.io and dicebear npm packages.
## 💻Code
### HTML:
Templates are used to attach new messages and alerts in the message container.
```html
    <template class="message-template">
        <div class="message-container">
            <div class="avatar"></div>
            <div class="message">
                <div class="message-head">
                    <span class="name"></span>
                    <span class="time"></span>
                </div>
                <div class="message-body"></div>
            </div>
        </div>
    </template>
```
The template is cloned in the javascript everytime a new messagge is to be inserted, and required values are put in the place. Once done, the message is attached to the message container.
```javascript
    // select template content
    const messageTemplate = document.querySelector(".message-template").content;
    
    // clone for using agan and again
    let messageElement = messageTemplate.cloneNode(true);
    // ...specify other details
    container.append(messageElement);
```

### JavaScript:
The server and client work together to handle events raised.  
Server side is responsible to communicate between differernt users (sockets) while chient side handles all client related processing.  

A http server is at required port is used to created a socket port with required cors permissions for cross origin resource origin to serve clients.
  ```javascript
    const httpServer = createServer();
    const io = new Server(httpServer, {
        cors: {
            origins: [
                "http://127.0.0.1:5500",
            ],
            methods: ["GET", "POST"],
        },
    });
    httpServer.listen(port, () => {
        console.log(`Working on ${port}`);
    });
  ```

A map of users object is created for mapping between socket_id and username to store and identify users.

**Socket.io communication** :
* When a new user is connected, **connection** event is automatically emitted by the client, which is listened by the server indicating the user has joined and proessing can be done for this user socket now.
  ```javascript
    io.on("connection", (socket) => {
        //...server side processing
    });
  ```

* Now custom events can be created and emitted by both server and client to communicate and run specific pieces of code on their end.

* Every time a new user is connected, a **'new-user'** event is emitted from the client along with the username of that user.
  ```javascript
  // emitted by client/user
  socket.emit("new-user", userName);
  ```
  This event is listened on the server side, which does the requierd processing and send back events as response for the client.
  ```javascript
    socket.on("new-user", (name) => {
        //...server side processing
    });
  ```
  Notice socket is used here, implying the event and further related processing is carried for this current user (who emitted the *'new-user'* event in first place).

* Bottts Neutral of Dicebar package is used to create random bots avatar, a rondom color is also generated for every user. Details related to every user are stored in the users object.

* Finally an **'i-connectd'** event is emitted only for the current user to send back details of this user to client side and a **'new-user-connected'** event is emitted to all users for an alert regarding new user. A **'user-count-change'** event is also emitted which is used to update number of online users every time a user is connected or disconnected.
  ```javascript
    // server side
    //
    // emitted for current user (corresponding to socket) only
    socket.emit("i-connected", obj);
    
    // emitted for all users
    io.emit("new-user-connected", data);
    io.emit("user-count-change", total_users);
  ```

* When a chat message is send, client side emitts an event which is then brodcasted by server side to all other users (sockets).
  ```javascript
    // client side
    socket.emit("send-chat-message", message);

    // server side
    socket.on("send-chat-message", (message) => {
        // send message to all except this user
        socket.broadcast.emit("chat-message", message);
    });
  ```
* Finally when a user disconnects, a **'disconnect'** event is automatically emitted, which is used by the server side to delete that user form the mapping.
  ```javascript
    socket.on("disconnect", () => {
        delete users[socket.id];
    });
  ```

**Client side** :  
*Textarea* is used for entering message. Height of text area is dynamically increased using this code:
```javascript
    messageInput.addEventListener("input", () => {
        messageInput.style.height = "auto";
        messageInput.style.height = messageInput.scrollHeight + "px";
        // if only newline, value is deleted and height is set to unset (original)
        if (messageInput.value == "\n") {
            messageInput.value = "";
            messageInput.style.height = "unset";
        }
    });
```
In HTML/CSS, 3 level herarcy is used. First is `#send-container` for input with max and min height, second is `.message-input-wrappe` for text area with overflow hidden and max-height inherit, to make sure till where the inner overflow should be shown in the outer container and finally the inner text-area (`.message-input`) whose height is dynamically increased using javascript shown above.

## 📚References
* [Get Started socket.io](https://socket.io/get-started/chat)
* https://www.youtube.com/watch?v=rxzOqP9YwmM
* https://stackoverflow.com

---
Utkarsh Chauhan  
[@UTK_CHAUHAN](https://twitter.com/UTK_CHAUHAN)
