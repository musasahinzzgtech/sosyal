import { Document, Types } from 'mongoose';
export type ConversationDocument = Conversation & Document;
export declare class Conversation extends Document {
    _id: Types.ObjectId;
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    lastMessageContent?: string;
    lastMessageTime?: Date;
    lastMessageSender?: Types.ObjectId;
    unreadCounts: Map<string, number>;
    title?: string;
    description?: string;
    isGroupChat: boolean;
    admin?: Types.ObjectId;
    isActive: boolean;
    mutedParticipants?: Types.ObjectId[];
    pinnedMessages?: Types.ObjectId[];
}
export declare const ConversationSchema: import("mongoose").Schema<Conversation, import("mongoose").Model<Conversation, any, any, any, Document<unknown, any, Conversation> & Conversation & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conversation, Document<unknown, {}, import("mongoose").FlatRecord<Conversation>> & import("mongoose").FlatRecord<Conversation> & Required<{
    _id: Types.ObjectId;
}>>;
