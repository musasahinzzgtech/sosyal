import { IsEmail, IsString, IsEnum, IsOptional, IsNumber, IsArray, MinLength, IsDateString } from 'class-validator';
import { UserType, BusinessType } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  city: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(UserType)
  userType: UserType;

  // Customer specific fields
  @IsOptional()
  @IsString()
  preferences?: string;

  // Service provider specific fields
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  @IsOptional()
  @IsNumber()
  experience?: number;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  priceRange?: string;

  // Profile photos
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
