import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { UsersService } from '../users/users.service';
export declare class MessagesService {
    private messageModel;
    private conversationModel;
    private usersService;
    constructor(messageModel: Model<MessageDocument>, conversationModel: Model<ConversationDocument>, usersService: UsersService);
    createMessage(senderId: string, receiverId: string, content: string, type?: string, fileUrl?: string, fileName?: string, fileSize?: number): Promise<Message>;
    findOrCreateConversation(userId1: string, userId2: string): Promise<Conversation>;
    getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
    getUserConversations(userId: string): Promise<Conversation[]>;
    getConversationByParticipants(participantIds: string[], userId: string): Promise<Conversation | null>;
    findOne(messageId: string): Promise<Message | null>;
    markMessageAsRead(messageId: string, userId: string): Promise<void>;
    markConversationAsRead(conversationId: string, userId: string): Promise<void>;
    deleteMessage(messageId: string, userId: string): Promise<void>;
    editMessage(messageId: string, userId: string, newContent: string): Promise<Message>;
    getUnreadCount(userId: string): Promise<number>;
}
