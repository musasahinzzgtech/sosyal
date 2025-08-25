import { Document, Types } from "mongoose";
export type UserDocument = User & Document;
export declare enum UserType {
    MUSTERI = "musteri",
    ILAN_VEREN = "ilan-veren"
}
export declare class User extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    birthDate: Date;
    userType: UserType;
    height?: number;
    weight?: number;
    age?: number;
    skinColor?: string;
    services?: string;
    priceRange?: string;
    photos?: string[];
    isOnline: boolean;
    lastSeen?: Date;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    isActive: boolean;
    refreshToken?: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: Types.ObjectId;
}>>;
