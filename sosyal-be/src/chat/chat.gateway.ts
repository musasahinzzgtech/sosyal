import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token and get user info
      const user = await this.verifyToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.userId = user.id;
      client.userEmail = user.email;

      // Add user to connected users
      this.connectedUsers.set(user.id, client.id);

      // Update user's online status
      await this.usersService.updateOnlineStatus(user.id, true);

      // Join user to their personal room
      client.join(`user:${user.id}`);

      // Notify other users about this user coming online
      client.broadcast.emit('user:online', {
        userId: user.id,
        timestamp: new Date(),
      });

      console.log(`User ${user.email} connected: ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remove user from connected users
      this.connectedUsers.delete(client.userId);

      // Update user's online status
      await this.usersService.updateOnlineStatus(client.userId, false);

      // Notify other users about this user going offline
      client.broadcast.emit('user:offline', {
        userId: client.userId,
        timestamp: new Date(),
      });

      console.log(`User ${client.userEmail} disconnected: ${client.id}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: {
      receiverId: string;
      content: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Create message in database
      const message = await this.messagesService.createMessage(
        client.userId,
        data.receiverId,
        data.content,
        data.type,
        data.fileUrl,
        data.fileName,
        data.fileSize,
      );
      console.log("message", message);

      // Get sender info from user service
      const sender = await this.usersService.findOne(client.userId);

      const messageData = {
        id: message._id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        receiverId: message.receiverId,
        status: message.status,
        createdAt: new Date(),
        sender: sender,
      };

      // Send to receiver if online
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('message:receive', messageData);
        console.log("message:receive", messageData);
      }

      // Send confirmation to sender
      client.emit('message:sent', {
        ...messageData,
        status: 'delivered',
      });

      // Emit typing stop event
      this.server.to(`user:${data.receiverId}`).emit('typing:stop', {
        userId: client.userId,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('message:error', {
        error: 'Failed to send message',
        details: error.message,
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.messagesService.markMessageAsRead(data.messageId, client.userId);

      // Get the message to find the sender
      const message = await this.messagesService.findOne(data.messageId);

      if (message) {
        const senderSocketId = this.connectedUsers.get(
          message.senderId.toString(),
        );
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('message:read', {
            messageId: data.messageId,
            readBy: client.userId,
            readAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Notify receiver that user is typing
    this.server.to(`user:${data.receiverId}`).emit('typing:start', {
      userId: client.userId,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Notify receiver that user stopped typing
    this.server.to(`user:${data.receiverId}`).emit('typing:stop', {
      userId: client.userId,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('user:typing')
  async handleUserTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (data.isTyping) {
      this.server.to(`user:${data.receiverId}`).emit('user:typing', {
        userId: client.userId,
        isTyping: true,
      });
    } else {
      this.server.to(`user:${data.receiverId}`).emit('user:typing', {
        userId: client.userId,
        isTyping: false,
      });
    }
  }

  // Helper method to verify JWT token
  private async verifyToken(token: string): Promise<any> {
    try {
      // This is a simplified verification - in production, use proper JWT verification
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user exists and is active
      const user = await this.usersService.findOne(decoded.sub);
      if (!user || !user.isActive) {
        return null;
      }
      
      return {
        id: user._id.toString(),
        email: user.email,
      };
    } catch (error) {
      return null;
    }
  }

  // Get online users
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
