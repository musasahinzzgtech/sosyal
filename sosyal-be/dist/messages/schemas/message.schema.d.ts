import { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export declare class Message extends Document {
    _id: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    status: MessageStatus;
    readAt?: Date;
    deliveredAt?: Date;
    type: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: Types.ObjectId;
    forwardedFrom?: Types.ObjectId;
    reactions?: Map<string, string>;
    isDeleted: boolean;
    isEdited: boolean;
    originalContent?: string;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message> & Message & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>> & import("mongoose").FlatRecord<Message> & Required<{
    _id: Types.ObjectId;
}>>;
