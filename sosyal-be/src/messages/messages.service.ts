import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, MessageStatus } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private usersService: UsersService,
  ) {}

  async createMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: string = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
  ): Promise<Message> {
    try {
      console.log('Creating message with params:', { senderId, receiverId, content, type });
      
      // Validate inputs
      if (!senderId || !receiverId || !content) {
        throw new Error('Missing required parameters: senderId, receiverId, or content');
      }

      // Create or find conversation
      let conversation = await this.findOrCreateConversation(senderId, receiverId);
      console.log('Conversation found/created:', conversation._id);

      // Create message
      const message = new this.messageModel({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        status: MessageStatus.SENT,
      });

      const savedMessage = await message.save();
      console.log('Message saved successfully:', savedMessage._id);

      // Update conversation with last message
      await this.conversationModel.findByIdAndUpdate(conversation._id, {
        lastMessage: savedMessage._id,
        lastMessageContent: content,
        lastMessageTime: new Date(),
        lastMessageSender: new Types.ObjectId(senderId),
        [`unreadCounts.${receiverId}`]: (conversation.unreadCounts?.get(receiverId) || 0) + 1,
      });

      console.log('Conversation updated successfully');
      return savedMessage;
    } catch (error) {
      console.error('Error in createMessage:', error);
      throw error;
    }
  }

  async findOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
    try {
      console.log('Finding or creating conversation for users:', { userId1, userId2 });
      
      const participants = [new Types.ObjectId(userId1), new Types.ObjectId(userId2)].sort();
      console.log('Sorted participants:', participants);
      
      let conversation = await this.conversationModel.findOne({
        participants: { $all: participants, $size: participants.length },
        isGroupChat: false,
      });

      if (!conversation) {
        console.log('No existing conversation found, creating new one');
        conversation = new this.conversationModel({
          participants,
          unreadCounts: new Map(),
          isGroupChat: false,
        });
        await conversation.save();
        console.log('New conversation created:', conversation._id);
      } else {
        console.log('Existing conversation found:', conversation._id);
      }

      return conversation;
    } catch (error) {
      console.error('Error in findOrCreateConversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    // First get the conversation to find participants
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Find messages between the participants
    // A message belongs to this conversation if both sender and receiver are participants
    return this.messageModel
      .find({ 
        $and: [
          { senderId: { $in: conversation.participants } },
          { receiverId: { $in: conversation.participants } }
        ]
      })
      .sort({ createdAt: 1 }) // Sort by creation time ascending for proper message order
      .skip(offset)
      .limit(limit)
      .populate('senderId', 'firstName lastName photos')
      .populate('receiverId', 'firstName lastName photos')
      .exec();
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    console.log('Getting conversations for user:', userId);
    return this.conversationModel
      .find({ 
        participants: { $in: [new Types.ObjectId(userId)] },
        isActive: true 
      })
      .populate('participants', 'firstName lastName photos isOnline lastSeen')
      .populate('lastMessage')
      .populate('lastMessageSender', 'firstName lastName photos')
      .sort({ lastMessageTime: -1 })
      .exec();
  }

  async getConversationByParticipants(participantIds: string[], userId: string): Promise<Conversation | null> {
    // Ensure the current user is one of the participants
    if (!participantIds.includes(userId)) {
      return null;
    }

    const participants = participantIds.map(id => new Types.ObjectId(id)).sort();
    
    return this.conversationModel
      .findOne({
        participants: { $all: participants, $size: participants.length },
        isGroupChat: false,
        isActive: true
      })
      .populate('participants', 'firstName lastName photos isOnline lastSeen')
      .populate('lastMessage')
      .populate('lastMessageSender', 'firstName lastName photos')
      .exec();
  }

  async findOne(messageId: string): Promise<Message | null> {
    return this.messageModel.findById(messageId).exec();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId.toString() === userId) {
      await this.messageModel.findByIdAndUpdate(messageId, {
        status: MessageStatus.READ,
        readAt: new Date(),
      });

      // Update conversation unread count
      const conversation = await this.conversationModel.findOne({
        participants: { $all: [message.senderId, message.receiverId] }
      });

      if (conversation) {
        const currentCount = conversation.unreadCounts?.get(userId) || 0;
        if (currentCount > 0) {
          conversation.unreadCounts.set(userId, currentCount - 1);
          await conversation.save();
        }
      }
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Mark all unread messages as read
    await this.messageModel.updateMany(
      {
        receiverId: new Types.ObjectId(userId),
        status: { $ne: MessageStatus.READ }
      },
      {
        status: MessageStatus.READ,
        readAt: new Date(),
      }
    );

    // Reset unread count for this user
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await this.messageModel.findByIdAndUpdate(messageId, {
      isDeleted: true,
      originalContent: message.content,
      content: 'This message was deleted',
    });
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new Error('Unauthorized to edit this message');
    }

    return this.messageModel.findByIdAndUpdate(
      messageId,
      {
        content: newContent,
        isEdited: true,
        originalContent: message.originalContent || message.content,
      },
      { new: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await this.conversationModel.find({
      participants: new Types.ObjectId(userId)
    });

    let totalUnread = 0;
    for (const conversation of conversations) {
      totalUnread += conversation.unreadCounts?.get(userId) || 0;
    }

    return totalUnread;
  }
}
