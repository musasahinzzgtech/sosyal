import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation extends Document {
  _id: Types.ObjectId;

  @Prop({ required: true, type: [Types.ObjectId], ref: 'User' })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop()
  lastMessageContent?: string;

  @Prop()
  lastMessageTime?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastMessageSender?: Types.ObjectId;

  // Unread message counts for each participant
  @Prop({ type: Map, of: Number })
  unreadCounts: Map<string, number>;

  // Conversation metadata
  @Prop()
  title?: string;

  @Prop()
  description?: string;

  // Group chat properties
  @Prop({ default: false })
  isGroupChat: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  admin?: Types.ObjectId;

  // Conversation settings
  @Prop({ default: true })
  isActive: boolean;

  // Muted participants
  @Prop({ type: [Types.ObjectId], ref: 'User' })
  mutedParticipants?: Types.ObjectId[];

  // Pinned messages
  @Prop({ type: [Types.ObjectId], ref: 'Message' })
  pinnedMessages?: Types.ObjectId[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes for efficient querying
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageTime: -1 });

// Compound index for finding conversations by participants
ConversationSchema.index({ 
  participants: 1, 
  isActive: 1 
});
