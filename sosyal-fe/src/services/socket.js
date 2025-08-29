import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.reconnectDelay = 1000;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
    this.onlineHandlers = new Map();
    this.typingThrottle = new Map(); // Throttle typing events per user
    this.lastTypingTime = new Map(); // Track last typing time per user
    this.connectionTimeout = null;
    this.heartbeatInterval = null;
    this.cleanupCallbacks = [];
    this.messageQueue = []; // Queue messages when disconnected
    this.isProcessingQueue = false;
  }

  // Connect to WebSocket server with connection pooling
  async connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.isConnected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            resolve(this.connect(token));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    try {
      this.isConnecting = true;

      // Clear any existing connection
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io("http://localhost:3001/chat", {
        auth: { token },
        transports: ["websocket"],
        autoConnect: true,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      return new Promise((resolve, reject) => {
        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.isConnecting = false;
            reject(new Error("Connection timeout"));
          }
        }, 10000);

        this.socket.on("connect", () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.connectionAttempts = 0;
          clearTimeout(this.connectionTimeout);

          // Start heartbeat
          this.startHeartbeat();

          // Process queued messages
          this.processMessageQueue();

          console.log("WebSocket connected successfully");
          resolve(this.socket);
        });

        this.socket.on("disconnect", (reason) => {
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();

          if (reason === "io server disconnect") {
            // Server disconnected us, try to reconnect
            this.reconnect(token);
          }
        });

        this.socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          this.isConnected = false;
          this.isConnecting = false;
          clearTimeout(this.connectionTimeout);

          this.connectionAttempts++;
          if (this.connectionAttempts < this.maxConnectionAttempts) {
            setTimeout(() => this.reconnect(token), this.reconnectDelay);
          }

          reject(error);
        });

        // Set up message handlers
        this.setupMessageHandlers();
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  // Reconnect with exponential backoff
  async reconnect(token) {
    if (this.isConnecting || this.isConnected) return;

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.connectionAttempts),
      10000
    );
    setTimeout(() => {
      this.connect(token).catch(console.error);
    }, delay);
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit("ping");
      }
    }, 30000); // Send ping every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Queue message when disconnected
  queueMessage(messageData) {
    this.messageQueue.push({
      ...messageData,
      timestamp: Date.now(),
      retryCount: 0,
    });
  }

  // Process queued messages
  async processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0 && this.isConnected) {
      const messageData = this.messageQueue.shift();

      try {
        await this.sendMessageDirectly(messageData);
      } catch (error) {
        console.error("Failed to send queued message:", error);

        // Re-queue message if retry count is less than 3
        if (messageData.retryCount < 3) {
          messageData.retryCount++;
          this.messageQueue.unshift(messageData);
        }
      }

      // Small delay between messages
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  // Send message directly without queuing
  async sendMessageDirectly(messageData) {
    if (!this.isConnected || !this.socket) {
      throw new Error("WebSocket not connected");
    }

    this.socket.emit("message:send", messageData);
  }

  // Disconnect from WebSocket server
  disconnect() {
    this.stopHeartbeat();

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.connectionAttempts = 0;

    // Clear all handlers
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.onlineHandlers.clear();
    this.typingThrottle.clear();
    this.lastTypingTime.clear();

    // Execute cleanup callbacks
    this.cleanupCallbacks.forEach((callback) => callback());
    this.cleanupCallbacks = [];

    // Clear message queue
    this.messageQueue = [];
    this.isProcessingQueue = false;
  }

  // Set up message event handlers
  setupMessageHandlers() {
    if (!this.socket) return;

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

    // Handle pong response
    this.socket.on("pong", () => {
      // Connection is alive
    });
  }

  // Send a message with queuing and retry logic
  async sendMessage(
    receiverId,
    content,
    type = "text",
    fileUrl,
    fileName,
    fileSize,
    messageObject = {}
  ) {
    const messageData = {
      messageObject,
      receiverId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
    };

    if (!this.isConnected) {
      // Queue message if disconnected
      this.queueMessage(messageData);
      throw new Error("WebSocket not connected, message queued");
    }

    try {
      return await this.sendMessageDirectly(messageData);
    } catch (error) {
      // Queue message on failure
      this.queueMessage(messageData);
      throw error;
    }
  }

  // Mark message as read
  markMessageAsRead(messageId) {
    if (!this.isConnected || !this.socket) {
      throw new Error("WebSocket not connected");
    }

    this.socket.emit("message:read", { messageId });
  }

  // Start typing indicator with throttling
  startTyping(receiverId) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    const now = Date.now();
    const lastTime = this.lastTypingTime.get(receiverId) || 0;

    // Throttle typing events to prevent spam (minimum 1 second between events)
    if (now - lastTime < 1000) {
      return;
    }

    this.lastTypingTime.set(receiverId, now);
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

  // Register message event handlers with cleanup tracking
  onMessage(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);

    // Track cleanup callback
    const cleanup = () => this.offMessage(event, handler);
    this.cleanupCallbacks.push(cleanup);

    return cleanup; // Return cleanup function
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

  // Register typing event handlers with cleanup tracking
  onTyping(event, handler) {
    if (!this.typingHandlers.has(event)) {
      this.typingHandlers.set(event, []);
    }
    this.typingHandlers.get(event).push(handler);

    // Track cleanup callback
    const cleanup = () => this.offTyping(event, handler);
    this.cleanupCallbacks.push(cleanup);

    return cleanup; // Return cleanup function
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

  // Register online status event handlers with cleanup tracking
  onOnlineStatus(event, handler) {
    if (!this.onlineHandlers.has(event)) {
      this.onlineHandlers.set(event, []);
    }
    this.onlineHandlers.get(event).push(handler);

    // Track cleanup callback
    const cleanup = () => this.offOnlineStatus(event, handler);
    this.cleanupCallbacks.push(cleanup);

    return cleanup; // Return cleanup function
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

  // Notify message handlers with error handling
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

  // Notify typing handlers with error handling
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

  // Notify online status handlers with error handling
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

  // Get connection info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      connectionAttempts: this.connectionAttempts,
      socketId: this.socket?.id,
      messageQueueLength: this.messageQueue.length,
    };
  }

  // Wait for connection to be established
  async waitForConnection(timeout = 10000) {
    if (this.isConnected) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, timeout);

      const checkConnection = () => {
        if (this.isConnected) {
          clearTimeout(timeoutId);
          resolve(true);
        } else if (!this.isConnecting) {
          clearTimeout(timeoutId);
          reject(new Error("Connection failed"));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  // Debug method to monitor socket performance
  getDebugInfo() {
    return {
      connectionStatus: this.getConnectionStatus(),
      connectionInfo: this.getConnectionInfo(),
      messageHandlersCount: this.messageHandlers.size,
      typingHandlersCount: this.typingHandlers.size,
      onlineHandlersCount: this.onlineHandlers.size,
      cleanupCallbacksCount: this.cleanupCallbacks.length,
      typingThrottleCount: this.typingThrottle.size,
      lastTypingTimeCount: this.lastTypingTime.size,
      messageQueueLength: this.messageQueue.length,
      isProcessingQueue: this.isProcessingQueue,
    };
  }

  // Reset connection state (useful for testing)
  reset() {
    this.disconnect();
    this.connectionAttempts = 0;
    this.isConnecting = false;
  }
}

export default new SocketService();
