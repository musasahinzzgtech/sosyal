import { UserType, BusinessType } from '../schemas/user.schema';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    birthDate: string;
    userType: UserType;
    preferences?: string;
    businessName?: string;
    businessType?: BusinessType;
    experience?: number;
    services?: string;
    workingHours?: string;
    priceRange?: string;
    photos?: string[];
}
