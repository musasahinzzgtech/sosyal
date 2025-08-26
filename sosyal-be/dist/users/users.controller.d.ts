import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserType } from "./schemas/user.schema";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUserDetails(req: any): Promise<import("./schemas/user.schema").User>;
    uploadPhoto(req: any, file: any): Promise<{
        message: string;
        photoUrl: string;
        filename: any;
    }>;
    uploadPhotos(req: any, files: any[]): Promise<{
        message: string;
        photoUrls: string[];
        count: number;
    }>;
    removePhoto(req: any): Promise<{
        message: string;
    }>;
    test(): {
        message: string;
    };
    health(): {
        status: string;
        controller: string;
        timestamp: string;
    };
    registerWithPhotos(userDataString: string, photos?: any[]): Promise<{
        message: string;
        user: any;
    }>;
    findAll(): Promise<import("./schemas/user.schema").User[]>;
    searchUsers(query: string, userType: UserType, city: string): Promise<import("./schemas/user.schema").User[]>;
    getServiceProviders(city: string): Promise<import("./schemas/user.schema").User[]>;
    getCustomers(city: string): Promise<import("./schemas/user.schema").User[]>;
    findOne(id: string): Promise<import("./schemas/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<import("./schemas/user.schema").User>;
    remove(id: string, req: any): Promise<void>;
    updateOnlineStatus(id: string, isOnline: boolean, req: any): Promise<void>;
}
