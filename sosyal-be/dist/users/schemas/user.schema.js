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
exports.UserSchema = exports.User = exports.BusinessType = exports.UserType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var UserType;
(function (UserType) {
    UserType["MUSTERI"] = "musteri";
    UserType["ILAN_VEREN"] = "ilan-veren";
})(UserType || (exports.UserType = UserType = {}));
var BusinessType;
(function (BusinessType) {
    BusinessType["SPA_MASAJ"] = "Spa & Masaj";
    BusinessType["GUZELLIK_SALONU"] = "G\u00FCzellik Salonu";
    BusinessType["FITNESS_SPOR"] = "Fitness & Spor";
    BusinessType["SAGLIK_TERAPI"] = "Sa\u011Fl\u0131k & Terapi";
    BusinessType["EGELENCE_DANS"] = "E\u011Flence & Dans";
    BusinessType["D\u0130GER"] = "Di\u011Fer";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
let User = class User extends mongoose_2.Document {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], User.prototype, "birthDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: UserType }),
    __metadata("design:type", String)
], User.prototype, "userType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "preferences", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "businessName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: BusinessType }),
    __metadata("design:type", String)
], User.prototype, "businessType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], User.prototype, "experience", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "services", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "workingHours", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "priceRange", void 0);
__decorate([
    (0, mongoose_1.Prop)([String]),
    __metadata("design:type", Array)
], User.prototype, "photos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isOnline", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastSeen", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "reviewCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "refreshToken", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({
    firstName: 'text',
    lastName: 'text',
    city: 'text',
    businessName: 'text',
    services: 'text'
});
exports.UserSchema.index({ userType: 1, city: 1 });
exports.UserSchema.index({ email: 1 });
exports.UserSchema.index({ phone: 1 });
//# sourceMappingURL=user.schema.js.map