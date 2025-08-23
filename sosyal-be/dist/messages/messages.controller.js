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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    async createMessage(body, req) {
        return this.messagesService.createMessage(req.user.id, body.receiverId, body.content, body.type, body.fileUrl, body.fileName, body.fileSize);
    }
    async getUserConversations(req) {
        return this.messagesService.getUserConversations(req.user.id);
    }
    async getConversationByParticipants(participants, req) {
        const participantIds = participants.split(',');
        return this.messagesService.getConversationByParticipants(participantIds, req.user.id);
    }
    async getConversationMessages(conversationId, limit = 50, offset = 0) {
        return this.messagesService.getConversationMessages(conversationId, limit, offset);
    }
    async markMessageAsRead(messageId, req) {
        await this.messagesService.markMessageAsRead(messageId, req.user.id);
        return { message: 'Message marked as read' };
    }
    async markConversationAsRead(conversationId, req) {
        await this.messagesService.markConversationAsRead(conversationId, req.user.id);
        return { message: 'Conversation marked as read' };
    }
    async deleteMessage(messageId, req) {
        await this.messagesService.deleteMessage(messageId, req.user.id);
        return { message: 'Message deleted' };
    }
    async editMessage(messageId, content, req) {
        return this.messagesService.editMessage(messageId, req.user.id, content);
    }
    async getUnreadCount(req) {
        const count = await this.messagesService.getUnreadCount(req.user.id);
        return { unreadCount: count };
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Get)('conversations/by-participants'),
    __param(0, (0, common_1.Query)('participants')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversationByParticipants", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Patch)(':messageId/read'),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markMessageAsRead", null);
__decorate([
    (0, common_1.Patch)('conversations/:conversationId/read'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markConversationAsRead", null);
__decorate([
    (0, common_1.Delete)(':messageId'),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Patch)(':messageId'),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "editMessage", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUnreadCount", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map