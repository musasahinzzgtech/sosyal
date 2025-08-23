import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    createMessage(body: {
        receiverId: string;
        content: string;
        type?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
    }, req: any): Promise<import("./schemas/message.schema").Message>;
    getUserConversations(req: any): Promise<import("./schemas/conversation.schema").Conversation[]>;
    getConversationByParticipants(participants: string, req: any): Promise<import("./schemas/conversation.schema").Conversation>;
    getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<import("./schemas/message.schema").Message[]>;
    markMessageAsRead(messageId: string, req: any): Promise<{
        message: string;
    }>;
    markConversationAsRead(conversationId: string, req: any): Promise<{
        message: string;
    }>;
    deleteMessage(messageId: string, req: any): Promise<{
        message: string;
    }>;
    editMessage(messageId: string, content: string, req: any): Promise<import("./schemas/message.schema").Message>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
}
