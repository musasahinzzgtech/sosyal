import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
    this.onlineHandlers = new Map();
  }

  // Connect to WebSocket server
  connect(token) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.socket = io("http://localhost:3001/chat", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnected = false;
    });

    // Set up message handlers
    this.setupMessageHandlers();
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Set up message event handlers
  setupMessageHandlers() {
    // Handle incoming messages
    this.socket.on("message:receive", (message) => {
      this.notifyMessageHandlers("message:receive", message);
    });

    // Handle message sent confirmation
    this.socket.on("message:sent", (message) => {
      this.notifyMessageHandlers("message:sent", message);
    });

    // Handle message read confirmation
    this.socket.on("message:read", (data) => {
      this.notifyMessageHandlers("message:read", data);
    });

    // Handle typing indicators
    this.socket.on("typing:start", (data) => {
      this.notifyTypingHandlers("typing:start", data);
    });

    this.socket.on("typing:stop", (data) => {
      this.notifyTypingHandlers("typing:stop", data);
    });

    // Handle user online/offline status
    this.socket.on("user:online", (data) => {
      this.notifyOnlineHandlers("user:online", data);
    });

    this.socket.on("user:offline", (data) => {
      this.notifyOnlineHandlers("user:offline", data);
    });

    // Handle errors
    this.socket.on("message:error", (error) => {
      console.error("WebSocket message error:", error);
    });
  }

  // Send a message
  sendMessage(
    receiverId,
    content,
    type = "text",
    fileUrl,
    fileName,
    fileSize,
    messageObject = {}
  ) {
    if (!this.isConnected || !this.socket) {
      throw new Error("WebSocket not connected");
    }

    this.socket.emit("message:send", {
      messageObject,
      receiverId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
    }, (response) => {
      console.log("xXXXXX: response", response);
    }); 
  }

  // Mark message as read
  markMessageAsRead(messageId) {
    if (!this.isConnected || !this.socket) {
      throw new Error("WebSocket not connected");
    }

    this.socket.emit("message:read", { messageId });
  }

  // Start typing indicator
  startTyping(receiverId) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit("typing:start", { receiverId });
  }

  // Stop typing indicator
  stopTyping(receiverId) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit("typing:stop", { receiverId });
  }

  // Set user typing status
  setUserTyping(receiverId, isTyping) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.emit("user:typing", { receiverId, isTyping });
  }

  // Register message event handlers
  onMessage(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  // Remove message event handlers
  offMessage(event, handler) {
    if (this.messageHandlers.has(event)) {
      const handlers = this.messageHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Register typing event handlers
  onTyping(event, handler) {
    if (!this.typingHandlers.has(event)) {
      this.typingHandlers.set(event, []);
    }
    this.typingHandlers.get(event).push(handler);
  }

  // Remove typing event handlers
  offTyping(event, handler) {
    if (this.typingHandlers.has(event)) {
      const handlers = this.typingHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Register online status event handlers
  onOnlineStatus(event, handler) {
    if (!this.onlineHandlers.has(event)) {
      this.onlineHandlers.set(event, []);
    }
    this.onlineHandlers.get(event).push(handler);
  }

  // Remove online status event handlers
  offOnlineStatus(event, handler) {
    if (this.onlineHandlers.has(event)) {
      const handlers = this.onlineHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Notify message handlers
  notifyMessageHandlers(event, data) {
    if (this.messageHandlers.has(event)) {
      this.messageHandlers.get(event).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error("Error in message handler:", error);
        }
      });
    }
  }

  // Notify typing handlers
  notifyTypingHandlers(event, data) {
    if (this.typingHandlers.has(event)) {
      this.typingHandlers.get(event).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error("Error in typing handler:", error);
        }
      });
    }
  }

  // Notify online status handlers
  notifyOnlineHandlers(event, data) {
    if (this.onlineHandlers.has(event)) {
      this.onlineHandlers.get(event).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error("Error in online status handler:", error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketService();
