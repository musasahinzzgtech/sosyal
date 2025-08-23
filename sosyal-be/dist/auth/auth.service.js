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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user._id.toString(), userType: user.userType };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);
        await this.usersService.updateOnlineStatus(user._id.toString(), true);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType,
                city: user.city,
                isOnline: true,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.usersService.findOne(payload.sub);
            if (!user || user.refreshToken !== refreshToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const newPayload = { email: user.email, sub: user._id.toString(), userType: user.userType };
            const newAccessToken = this.jwtService.sign(newPayload);
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });
            await this.usersService.updateRefreshToken(user._id.toString(), newRefreshToken);
            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.usersService.removeRefreshToken(userId);
        await this.usersService.updateOnlineStatus(userId, false);
        return { message: 'Logged out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map