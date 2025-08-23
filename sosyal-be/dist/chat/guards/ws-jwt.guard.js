"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const jsonwebtoken_1 = require("jsonwebtoken");
let WsJwtGuard = class WsJwtGuard {
    canActivate(context) {
        const client = context.switchToWs().getClient();
        const token = client.handshake.auth.token;
        if (!token) {
            throw new websockets_1.WsException('Token not provided');
        }
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            client.data.user = decoded;
            return true;
        }
        catch (err) {
            throw new websockets_1.WsException('Invalid token');
        }
    }
};
exports.WsJwtGuard = WsJwtGuard;
exports.WsJwtGuard = WsJwtGuard = __decorate([
    (0, common_1.Injectable)()
], WsJwtGuard);
//# sourceMappingURL=ws-jwt.guard.js.map