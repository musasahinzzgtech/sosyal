"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const messages_service_1 = require("../messages/messages.service");
const users_service_1 = require("../users/users.service");
const ws_jwt_guard_1 = require("./guards/ws-jwt.guard");
let ChatGateway = class ChatGateway {
    constructor(messagesService, usersService) {
        this.messagesService = messagesService;
        this.usersService = usersService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const user = await this.verifyToken(token);
            if (!user) {
                client.disconnect();
                return;
            }
            client.userId = user.id;
            client.userEmail = user.email;
            client.lastPing = Date.now();
            this.connectedUsers.set(user.id, client.id);
            await this.usersService.updateOnlineStatus(user.id, true);
            client.join(`user:${user.id}`);
            client.broadcast.emit("user:online", {
                userId: user.id,
                timestamp: new Date(),
            });
            console.log(`User ${user.email} connected: ${client.id}`);
        }
        catch (error) {
            console.error("Connection error:", error);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            await this.usersService.updateOnlineStatus(client.userId, false);
            client.broadcast.emit("user:offline", {
                userId: client.userId,
                timestamp: new Date(),
            });
            console.log(`User ${client.userEmail} disconnected: ${client.id}`);
        }
    }
    async handleMessage(data, client) {
        try {
            const message = await this.messagesService.createMessage(client.userId, data.receiverId, data.content, data.type, data.fileUrl, data.fileName, data.fileSize);
            console.log("message", message);
            const sender = await this.usersService.findOne(client.userId);
            const messageObj = message._doc;
            const messageData = {
                id: messageObj._id,
                content: messageObj.content,
                type: messageObj.type,
                senderId: messageObj.senderId,
                receiverId: messageObj.receiverId,
                status: messageObj.status,
                createdAt: messageObj.createdAt,
                sender: sender,
            };
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit("message:receive", messageData);
                console.log("message:receive", messageData);
            }
            client.emit("message:sent", {
                ...messageData,
                status: "delivered",
            });
            this.server.to(`user:${data.receiverId}`).emit("typing:stop", {
                userId: client.userId,
            });
        }
        catch (error) {
            console.error("Error sending message:", error);
            client.emit("message:error", {
                error: "Failed to send message",
                details: error.message,
            });
        }
    }
    async handleMessageRead(data, client) {
        try {
            await this.messagesService.markMessageAsRead(data.messageId, client.userId);
            const message = await this.messagesService.findOne(data.messageId);
            if (message) {
                const senderSocketId = this.connectedUsers.get(message.senderId.toString());
                if (senderSocketId) {
                    this.server.to(senderSocketId).emit("message:read", {
                        messageId: data.messageId,
                        readBy: client.userId,
                        readAt: new Date(),
                    });
                }
            }
        }
        catch (error) {
            console.error("Error marking message as read:", error);
        }
    }
    async handleTypingStart(data, client) {
        this.server.to(`user:${data.receiverId}`).emit("typing:start", {
            userId: client.userId,
            conversationId: data.conversationId,
        });
    }
    async handleTypingStop(data, client) {
        this.server.to(`user:${data.receiverId}`).emit("typing:stop", {
            userId: client.userId,
            conversationId: data.conversationId,
        });
    }
    async handleUserTyping(data, client) {
        if (data.isTyping) {
            this.server.to(`user:${data.receiverId}`).emit("user:typing", {
                userId: client.userId,
                isTyping: true,
            });
        }
        else {
            this.server.to(`user:${data.receiverId}`).emit("user:typing", {
                userId: client.userId,
                isTyping: false,
            });
        }
    }
    async verifyToken(token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await this.usersService.findOne(decoded.sub);
            if (!user || !user.isActive) {
                return null;
            }
            return {
                id: user._id.toString(),
                email: user.email,
            };
        }
        catch (error) {
            return null;
        }
    }
    getOnlineUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    cleanupInactiveConnections() {
        const now = Date.now();
        const timeout = 60000;
        this.server.sockets.sockets.forEach((socket) => {
            if (socket.lastPing && (now - socket.lastPing) > timeout) {
                console.log(`Cleaning up inactive socket: ${socket.id}`);
                socket.disconnect();
            }
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)("message:send"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)("message:read"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessageRead", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)("typing:start"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)("typing:stop"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)("user:typing"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleUserTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true,
        },
        namespace: "/chat",
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        users_service_1.UsersService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map