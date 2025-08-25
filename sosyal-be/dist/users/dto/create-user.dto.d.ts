import { UserType } from "../schemas/user.schema";
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    city: string;
    birthDate: string;
    age?: number;
    height?: number;
    weight?: number;
    skinColor?: string;
    userType: UserType;
    services?: string;
    priceRange?: string;
    photos?: string[];
}
