import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userEmail?: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    private usersService;
    server: Server;
    private connectedUsers;
    constructor(messagesService: MessagesService, usersService: UsersService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleMessage(data: {
        receiverId: string;
        content: string;
        type?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
    }, client: AuthenticatedSocket): Promise<void>;
    handleMessageRead(data: {
        messageId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleTypingStart(data: {
        receiverId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleTypingStop(data: {
        receiverId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleUserTyping(data: {
        receiverId: string;
        isTyping: boolean;
    }, client: AuthenticatedSocket): Promise<void>;
    private verifyToken;
    getOnlineUsers(): string[];
    isUserOnline(userId: string): boolean;
}
export {};
