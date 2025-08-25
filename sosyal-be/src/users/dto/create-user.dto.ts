import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { UserType } from "../schemas/user.schema";

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  city: string;

  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(100)
  age?: number;

  // Physical attributes
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @IsOptional() 
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @IsOptional()
  @IsString()
  skinColor?: string;

  @IsEnum(UserType)
  userType: UserType;

  // Service provider specific fields
  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  priceRange?: string;

  // Profile photos
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
