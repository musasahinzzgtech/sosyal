import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

export enum UserType {
  MUSTERI = "musteri",
  ISLETME = "isletme",
}

@Schema({ timestamps: true })
export class User extends Document {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: false })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, enum: UserType })
  userType: UserType;

  @Prop()
  businessName?: string;

  // Business-specific fields for ISLETME users
  @Prop()
  businessAddress?: string;

  @Prop()
  businessSector?: string;

  @Prop()
  businessServices?: string;

  // Social media fields
  @Prop()
  instagram?: string;

  @Prop()
  facebook?: string;

  // Profile photos
  @Prop([String])
  photos?: string[];

  // Online status
  @Prop({ default: false })
  isOnline: boolean;

  // Last seen
  @Prop()
  lastSeen?: Date;

  // Verification
  @Prop({ default: false })
  isVerified: boolean;

  // Rating and reviews
  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  // Account status
  @Prop({ default: true })
  isActive: boolean;

  // Refresh token
  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for search functionality
UserSchema.index({
  firstName: "text",
  lastName: "text",
  city: "text",
  businessServices: "text",
  businessSector: "text",
});

// Compound index for user type and city
UserSchema.index({ userType: 1, city: 1 });

// Index for email and phone
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
