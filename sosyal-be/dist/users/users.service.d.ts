import { Model } from "mongoose";
import { User, UserDocument, UserType } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    searchUsers(query: string, userType?: UserType, city?: string): Promise<User[]>;
    updateOnlineStatus(id: string, isOnline: boolean): Promise<void>;
    getUserDetails(id: string): Promise<User>;
    updateRefreshToken(id: string, refreshToken: string): Promise<void>;
    removeRefreshToken(id: string): Promise<void>;
    getServiceProviders(city?: string): Promise<User[]>;
    getCustomers(city?: string): Promise<User[]>;
    addPhoto(userId: string, photoUrl: string): Promise<User>;
    removePhoto(userId: string, photoUrl: string): Promise<User>;
    addBulkPhotos(userId: string, photoUrls: string[]): Promise<User>;
}
