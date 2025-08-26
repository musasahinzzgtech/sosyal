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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_schema_1 = require("./schemas/user.schema");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
        console.log("UsersController initialized");
    }
    async getUserDetails(req) {
        console.log("getUserDetails called with user:", req.user);
        console.log("Request URL:", req.url);
        console.log("Request method:", req.method);
        return this.usersService.getUserDetails(req.user.id);
    }
    async uploadPhoto(req, file) {
        const photoUrl = `/uploads/photos/${file.filename}`;
        await this.usersService.addPhoto(req.user.id, photoUrl);
        return {
            message: "Photo uploaded successfully",
            photoUrl,
            filename: file.filename,
        };
    }
    async uploadPhotos(req, files) {
        const photoUrls = files.map((file) => `/uploads/photos/${file.filename}`);
        await this.usersService.addBulkPhotos(req.user.id, photoUrls);
        return {
            message: "Photos uploaded successfully",
            photoUrls,
            count: files.length,
        };
    }
    async removePhoto(req) {
        const url = req.body.url;
        console.log("removePhoto called with url:", url);
        await this.usersService.removePhoto(req.user.id, url);
        return { message: "Photo removed successfully" };
    }
    test() {
        console.log("Test route called");
        return { message: "Users controller is working" };
    }
    health() {
        return {
            status: "ok",
            controller: "UsersController",
            timestamp: new Date().toISOString(),
        };
    }
    async registerWithPhotos(userDataString, photos) {
        try {
            let userData;
            try {
                userData = JSON.parse(userDataString);
            }
            catch (parseError) {
                throw new common_1.BadRequestException("Invalid JSON format in userData");
            }
            const requiredFields = [
                "firstName",
                "lastName",
                "email",
                "password",
                "city",
                "birthDate",
                "userType"
            ];
            const missingFields = requiredFields.filter(field => !userData[field]);
            if (missingFields.length > 0) {
                throw new common_1.BadRequestException(`Missing required fields: ${missingFields.join(", ")}`);
            }
            if (!["musteri", "isletme"].includes(userData.userType)) {
                throw new common_1.BadRequestException("Invalid userType. Must be 'musteri' or 'isletme'");
            }
            if (userData.userType === "isletme") {
                if (!userData.businessServices) {
                    throw new common_1.BadRequestException("businessServices is required for business users");
                }
            }
            const createUserDto = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone || "",
                password: userData.password,
                city: userData.city,
                birthDate: userData.birthDate,
                userType: userData.userType === "musteri"
                    ? user_schema_1.UserType.MUSTERI
                    : user_schema_1.UserType.ISLETME,
                businessAddress: userData.businessAddress || undefined,
                businessSector: userData.businessSector || undefined,
                businessServices: userData.businessServices || undefined,
                instagram: userData.instagram || undefined,
                facebook: userData.facebook || undefined,
            };
            let photoUrls = [];
            if (photos && photos.length > 0) {
                photoUrls = photos.map((photo) => `/uploads/photos/${photo.filename}`);
            }
            const userDataWithPhotos = {
                ...createUserDto,
                photos: photoUrls,
            };
            console.log("Creating user with data:", userDataWithPhotos);
            const createdUser = await this.usersService.create(userDataWithPhotos);
            const { password, ...userWithoutPassword } = createdUser.toObject();
            return {
                message: "User registered successfully",
                user: userWithoutPassword,
            };
        }
        catch (error) {
            console.error("Registration error:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error.code === 11000) {
                throw new common_1.BadRequestException("User with this email already exists");
            }
            throw new common_1.BadRequestException(`Registration failed: ${error.message || "Unknown error"}`);
        }
    }
    findAll() {
        return this.usersService.findAll();
    }
    searchUsers(query, userType, city) {
        return this.usersService.searchUsers(query, userType, city);
    }
    getServiceProviders(city) {
        return this.usersService.getServiceProviders(city);
    }
    getCustomers(city) {
        return this.usersService.getCustomers(city);
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, updateUserDto, req) {
        if (req.user.id.toString() !== id.toString()) {
            console.log("Unauthorized to update this profile", req.user.id, id);
            throw new Error("Unauthorized to update this profile");
        }
        return this.usersService.update(id, updateUserDto);
    }
    remove(id, req) {
        if (req.user.id !== id) {
            throw new Error("Unauthorized to delete this profile");
        }
        return this.usersService.remove(id);
    }
    updateOnlineStatus(id, isOnline, req) {
        if (req.user.id !== id) {
            throw new Error("Unauthorized to update this status");
        }
        return this.usersService.updateOnlineStatus(id, isOnline);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("profile/complete"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserDetails", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("upload-photo"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("photo", {
        storage: (0, multer_1.diskStorage)({
            destination: "./uploads/photos",
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join("");
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: ".(jpg|jpeg|png|gif)" }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)("upload-photos"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("photos", 10, {
        storage: (0, multer_1.diskStorage)({
            destination: "./uploads/photos",
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join("");
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: ".(jpg|jpeg|png|gif)" }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadPhotos", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)("remove-photo"),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removePhoto", null);
__decorate([
    (0, common_1.Get)("test"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "test", null);
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "health", null);
__decorate([
    (0, common_1.Post)("register-with-photos"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)("photos", 10, {
        storage: (0, multer_1.diskStorage)({
            destination: "./uploads/photos",
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join("");
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)("userData")),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerWithPhotos", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("search"),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Query)("userType")),
    __param(2, (0, common_1.Query)("city")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)("service-providers"),
    __param(0, (0, common_1.Query)("city")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getServiceProviders", null);
__decorate([
    (0, common_1.Get)("customers"),
    __param(0, (0, common_1.Query)("city")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id/online-status"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("isOnline")),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateOnlineStatus", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)("users"),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map