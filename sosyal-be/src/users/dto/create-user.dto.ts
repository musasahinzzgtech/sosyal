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
  ValidateIf,
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

  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsString()
  businessName?: string;

  // Business-specific fields for ISLETME users
  @ValidateIf((o) => o.userType === UserType.ISLETME)
  @IsString()
  businessAddress?: string;

  @ValidateIf((o) => o.userType === UserType.ISLETME)
  @IsString()
  businessSector?: string;

  @ValidateIf((o) => o.userType === UserType.ISLETME)
  @IsString()
  businessServices?: string;

  // Social media fields
  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  // Profile photos
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
