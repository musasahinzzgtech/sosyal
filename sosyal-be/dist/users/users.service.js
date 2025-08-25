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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const existingUser = await this.userModel.findOne({
            email: createUserDto.email.toLowerCase(),
        });
        if (existingUser) {
            throw new common_1.ConflictException("User with this email already exists");
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        const createdUser = new this.userModel({
            ...createUserDto,
            email: createUserDto.email.toLowerCase(),
            password: hashedPassword,
        });
        return createdUser.save();
    }
    async findAll() {
        return this.userModel
            .find({ isActive: true })
            .select("-password -refreshToken");
    }
    async findOne(id) {
        const user = await this.userModel
            .findById(id)
            .select("-password -refreshToken");
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email: email.toLowerCase() });
    }
    async update(id, updateUserDto) {
        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true, runValidators: true })
            .select("-password -refreshToken");
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async remove(id) {
        const result = await this.userModel.findByIdAndDelete(id);
        if (!result) {
            throw new common_1.NotFoundException("User not found");
        }
    }
    async searchUsers(query, userType, city) {
        let searchQuery = { isActive: true };
        if (userType) {
            searchQuery.userType = userType;
        }
        if (city) {
            searchQuery.city = { $regex: city, $options: "i" };
        }
        if (query) {
            searchQuery.$text = { $search: query };
        }
        return this.userModel
            .find(searchQuery)
            .select("-password -refreshToken")
            .sort({ rating: -1, reviewCount: -1 })
            .limit(20);
    }
    async updateOnlineStatus(id, isOnline) {
        await this.userModel.findByIdAndUpdate(id, {
            isOnline,
            lastSeen: isOnline ? undefined : new Date(),
        });
    }
    async getUserDetails(id) {
        console.log("getUserDetails service called with ID:", id);
        if (!id) {
            throw new common_1.NotFoundException("User ID is required");
        }
        const user = await this.userModel
            .findById(id)
            .select("-password -refreshToken")
            .lean();
        if (!user) {
            console.log("User not found with ID:", id);
            throw new common_1.NotFoundException("User not found");
        }
        console.log("User found:", {
            id: user._id,
            email: user.email,
            userType: user.userType,
        });
        const userDetails = {
            ...user,
            _id: user._id.toString(),
            id: user._id.toString(),
            photos: user.photos || [],
            rating: user.rating || 0,
            reviewCount: user.reviewCount || 0,
            isOnline: user.isOnline || false,
            isVerified: user.isVerified || false,
            isActive: user.isActive !== undefined ? user.isActive : true,
            services: user.services || "",
            priceRange: user.priceRange || "",
            phone: user.phone || "",
            city: user.city || "",
            birthDate: user.birthDate || null,
            lastSeen: user.lastSeen || null,
            createdAt: user.createdAt || new Date(),
        };
        console.log("Returning user details with ID field:", userDetails.id);
        return userDetails;
    }
    async updateRefreshToken(id, refreshToken) {
        await this.userModel.findByIdAndUpdate(id, { refreshToken });
    }
    async removeRefreshToken(id) {
        await this.userModel.findByIdAndUpdate(id, { refreshToken: null });
    }
    async getServiceProviders(city) {
        let query = {
            userType: user_schema_1.UserType.ILAN_VEREN,
            isActive: true,
        };
        if (city) {
            query.city = { $regex: city, $options: "i" };
        }
        return this.userModel
            .find(query)
            .select("-password -refreshToken")
            .sort({ rating: -1, reviewCount: -1 });
    }
    async getCustomers(city) {
        let query = {
            userType: user_schema_1.UserType.MUSTERI,
            isActive: true,
        };
        if (city) {
            query.city = { $regex: city, $options: "i" };
        }
        return this.userModel
            .find(query)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 });
    }
    async addPhoto(userId, photoUrl) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $push: { photos: photoUrl } }, { new: true, runValidators: true })
            .select("-password -refreshToken");
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async removePhoto(userId, photoUrl) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $pull: { photos: photoUrl } }, { new: true, runValidators: true })
            .select("-password -refreshToken");
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map