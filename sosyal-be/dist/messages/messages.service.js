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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const conversation_schema_1 = require("./schemas/conversation.schema");
const users_service_1 = require("../users/users.service");
let MessagesService = class MessagesService {
    constructor(messageModel, conversationModel, usersService) {
        this.messageModel = messageModel;
        this.conversationModel = conversationModel;
        this.usersService = usersService;
    }
    async createMessage(senderId, receiverId, content, type = 'text', fileUrl, fileName, fileSize) {
        try {
            console.log('Creating message with params:', { senderId, receiverId, content, type });
            if (!senderId || !receiverId || !content) {
                throw new Error('Missing required parameters: senderId, receiverId, or content');
            }
            let conversation = await this.findOrCreateConversation(senderId, receiverId);
            console.log('Conversation found/created:', conversation._id);
            const message = new this.messageModel({
                senderId: new mongoose_2.Types.ObjectId(senderId),
                receiverId: new mongoose_2.Types.ObjectId(receiverId),
                content,
                type,
                fileUrl,
                fileName,
                fileSize,
                status: message_schema_1.MessageStatus.SENT,
            });
            const savedMessage = await message.save();
            console.log('Message saved successfully:', savedMessage._id);
            await this.conversationModel.findByIdAndUpdate(conversation._id, {
                lastMessage: savedMessage._id,
                lastMessageContent: content,
                lastMessageTime: new Date(),
                lastMessageSender: new mongoose_2.Types.ObjectId(senderId),
                [`unreadCounts.${receiverId}`]: (conversation.unreadCounts?.get(receiverId) || 0) + 1,
            });
            console.log('Conversation updated successfully');
            return savedMessage;
        }
        catch (error) {
            console.error('Error in createMessage:', error);
            throw error;
        }
    }
    async findOrCreateConversation(userId1, userId2) {
        try {
            console.log('Finding or creating conversation for users:', { userId1, userId2 });
            const participants = [new mongoose_2.Types.ObjectId(userId1), new mongoose_2.Types.ObjectId(userId2)].sort();
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
            }
            else {
                console.log('Existing conversation found:', conversation._id);
            }
            return conversation;
        }
        catch (error) {
            console.error('Error in findOrCreateConversation:', error);
            throw error;
        }
    }
    async getConversationMessages(conversationId, limit = 50, offset = 0) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return this.messageModel
            .find({
            $and: [
                { senderId: { $in: conversation.participants } },
                { receiverId: { $in: conversation.participants } }
            ]
        })
            .sort({ createdAt: 1 })
            .skip(offset)
            .limit(limit)
            .populate('senderId', 'firstName lastName photos')
            .populate('receiverId', 'firstName lastName photos')
            .exec();
    }
    async getUserConversations(userId) {
        console.log('Getting conversations for user:', userId);
        return this.conversationModel
            .find({
            participants: { $in: [new mongoose_2.Types.ObjectId(userId)] },
            isActive: true
        })
            .populate('participants', 'firstName lastName photos isOnline lastSeen')
            .populate('lastMessage')
            .populate('lastMessageSender', 'firstName lastName photos')
            .sort({ lastMessageTime: -1 })
            .exec();
    }
    async getConversationByParticipants(participantIds, userId) {
        if (!participantIds.includes(userId)) {
            return null;
        }
        const participants = participantIds.map(id => new mongoose_2.Types.ObjectId(id)).sort();
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
    async findOne(messageId) {
        return this.messageModel.findById(messageId).exec();
    }
    async markMessageAsRead(messageId, userId) {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.receiverId.toString() === userId) {
            await this.messageModel.findByIdAndUpdate(messageId, {
                status: message_schema_1.MessageStatus.READ,
                readAt: new Date(),
            });
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
    async markConversationAsRead(conversationId, userId) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        await this.messageModel.updateMany({
            receiverId: new mongoose_2.Types.ObjectId(userId),
            status: { $ne: message_schema_1.MessageStatus.READ }
        }, {
            status: message_schema_1.MessageStatus.READ,
            readAt: new Date(),
        });
        conversation.unreadCounts.set(userId, 0);
        await conversation.save();
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
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
    async editMessage(messageId, userId, newContent) {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId.toString() !== userId) {
            throw new Error('Unauthorized to edit this message');
        }
        return this.messageModel.findByIdAndUpdate(messageId, {
            content: newContent,
            isEdited: true,
            originalContent: message.originalContent || message.content,
        }, { new: true });
    }
    async getUnreadCount(userId) {
        const conversations = await this.conversationModel.find({
            participants: new mongoose_2.Types.ObjectId(userId)
        });
        let totalUnread = 0;
        for (const conversation of conversations) {
            totalUnread += conversation.unreadCounts?.get(userId) || 0;
        }
        return totalUnread;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map