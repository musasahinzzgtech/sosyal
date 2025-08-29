import { UserType } from "../schemas/user.schema";
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    city: string;
    birthDate: string;
    userType: UserType;
    businessName?: string;
    businessAddress?: string;
    businessSector?: string;
    businessServices?: string;
    businessLatitude?: number;
    businessLongitude?: number;
    instagram?: string;
    facebook?: string;
    photos?: string[];
}
