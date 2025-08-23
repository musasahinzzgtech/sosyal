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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = exports.Message = exports.MessageStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
let Message = class Message extends mongoose_2.Document {
};
exports.Message = Message;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "receiverId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: MessageStatus.SENT }),
    __metadata("design:type", String)
], Message.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Message.prototype, "readAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Message.prototype, "deliveredAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'text' }),
    __metadata("design:type", String)
], Message.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Message.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Message.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Message.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Message' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "replyTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Message' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "forwardedFrom", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: String }),
    __metadata("design:type", Map)
], Message.prototype, "reactions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isEdited", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Message.prototype, "originalContent", void 0);
exports.Message = Message = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Message);
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
exports.MessageSchema.index({ senderId: 1, receiverId: 1 });
exports.MessageSchema.index({ receiverId: 1, createdAt: -1 });
exports.MessageSchema.index({ senderId: 1, createdAt: -1 });
exports.MessageSchema.index({
    senderId: 1,
    receiverId: 1,
    createdAt: -1
});
//# sourceMappingURL=message.schema.js.map