import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Schema({ timestamps: true })
export class Message extends Document {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  receiverId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: MessageStatus.SENT })
  status: MessageStatus;

  @Prop()
  readAt?: Date;

  @Prop()
  deliveredAt?: Date;

  // Message type (text, image, file, etc.)
  @Prop({ default: 'text' })
  type: string;

  // For file/image messages
  @Prop()
  fileUrl?: string;

  @Prop()
  fileName?: string;

  @Prop()
  fileSize?: number;

  // Reply to another message
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyTo?: Types.ObjectId;

  // Forwarded message
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  forwardedFrom?: Types.ObjectId;

  // Message reactions
  @Prop({ type: Map, of: String })
  reactions?: Map<string, string>;

  // Message is deleted
  @Prop({ default: false })
  isDeleted: boolean;

  // Message is edited
  @Prop({ default: false })
  isEdited: boolean;

  // Original content if edited
  @Prop()
  originalContent?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for efficient querying
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

// Compound index for conversation queries
MessageSchema.index({ 
  senderId: 1, 
  receiverId: 1, 
  createdAt: -1 
});
