import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserType } from "./schemas/user.schema";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {
    console.log("UsersController initialized");
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile/complete")
  async getUserDetails(@Request() req) {
    console.log("getUserDetails called with user:", req.user);
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    // Get current user's complete profile
    return this.usersService.getUserDetails(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("upload-photo")
  @UseInterceptors(
    FileInterceptor("photo", {
      storage: diskStorage({
        destination: "./uploads/photos",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async uploadPhoto(
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: ".(jpg|jpeg|png|gif)" }),
        ],
      })
    )
    file: any
  ) {
    const photoUrl = `/uploads/photos/${file.filename}`;
    await this.usersService.addPhoto(req.user.id, photoUrl);
    return {
      message: "Photo uploaded successfully",
      photoUrl,
      filename: file.filename,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("upload-photos")
  @UseInterceptors(
    FilesInterceptor("photos", 10, {
      storage: diskStorage({
        destination: "./uploads/photos",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async uploadPhotos(
    @Request() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: ".(jpg|jpeg|png|gif)" }),
        ],
      })
    )
    files: any[]
  ) {
    const photoUrls = files.map((file) => `/uploads/photos/${file.filename}`);
    await this.usersService.addBulkPhotos(req.user.id, photoUrls);
    return {
      message: "Photos uploaded successfully",
      photoUrls,
      count: files.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete("remove-photo")
  async removePhoto(@Request() req) {
    const url = req.body.url;
    console.log("removePhoto called with url:", url);
    await this.usersService.removePhoto(req.user.id, url);
    return { message: "Photo removed successfully" };
  }

  @Get("test")
  test() {
    console.log("Test route called");
    return { message: "Users controller is working" };
  }

  @Get("health")
  health() {
    return {
      status: "ok",
      controller: "UsersController",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("register-with-photos")
  @UseInterceptors(
    FilesInterceptor("photos", 10, {
      storage: diskStorage({
        destination: "./uploads/photos",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async registerWithPhotos(
    @Body("userData") userDataString: string,
    @UploadedFiles() photos?: any[]
  ) {
    try {
      // Parse user data from string
      let userData;
      try {
        userData = JSON.parse(userDataString);
      } catch (parseError) {
        throw new BadRequestException("Invalid JSON format in userData");
      }

      // Validate required fields
      const requiredFields = [
        "firstName",
        "lastName", 
        "email",
        "password",
        "city",
        "birthDate",
        "userType"
      ];
      
      const missingFields = requiredFields.filter(field => !userData[field]);
      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      // Validate userType
      if (!["musteri", "isletme"].includes(userData.userType)) {
        throw new BadRequestException("Invalid userType. Must be 'musteri' or 'isletme'");
      }

      // Validate business fields for business users
      if (userData.userType === "isletme") {
        if (!userData.businessServices) {
          throw new BadRequestException("businessServices is required for business users");
        }
      }

      // Map frontend fields to backend DTO
      const createUserDto: CreateUserDto = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || "",
        password: userData.password,
        city: userData.city,
        birthDate: userData.birthDate,
        userType:
          userData.userType === "musteri"
            ? UserType.MUSTERI
            : UserType.ISLETME,
        // Business-specific fields
        businessAddress: userData.businessAddress || undefined,
        businessSector: userData.businessSector || undefined,
        businessServices: userData.businessServices || undefined,
        // Social media fields
        instagram: userData.instagram || undefined,
        facebook: userData.facebook || undefined,
      };

      // Handle photo uploads if provided
      let photoUrls: string[] = [];
      if (photos && photos.length > 0) {
        photoUrls = photos.map((photo) => `/uploads/photos/${photo.filename}`);
      }

      // Add photo URLs to user data
      const userDataWithPhotos = {
        ...createUserDto,
        photos: photoUrls,
      };

      console.log("Creating user with data:", userDataWithPhotos);
      const createdUser = await this.usersService.create(userDataWithPhotos);

      // Return user data without password
      const { password, ...userWithoutPassword } = createdUser.toObject();
      return {
        message: "User registered successfully",
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 11000) {
        throw new BadRequestException("User with this email already exists");
      }
      throw new BadRequestException(
        `Registration failed: ${error.message || "Unknown error"}`
      );
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get("search")
  searchUsers(
    @Query("q") query: string,
    @Query("userType") userType: UserType,
    @Query("city") city: string
  ) {
    return this.usersService.searchUsers(query, userType, city);
  }

  @Get("service-providers")
  getServiceProviders(@Query("city") city: string) {
    return this.usersService.getServiceProviders(city);
  }

  @Get("customers")
  getCustomers(@Query("city") city: string) {
    return this.usersService.getCustomers(city);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    // Ensure user can only update their own profile
    if (req.user.id.toString() !== id.toString()) {
      console.log("Unauthorized to update this profile", req.user.id, id);
      throw new Error("Unauthorized to update this profile");
    }
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    // Ensure user can only delete their own profile
    if (req.user.id !== id) {
      throw new Error("Unauthorized to delete this profile");
    }
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/online-status")
  updateOnlineStatus(
    @Param("id") id: string,
    @Body("isOnline") isOnline: boolean,
    @Request() req
  ) {
    // Ensure user can only update their own online status
    if (req.user.id !== id) {
      throw new Error("Unauthorized to update this status");
    }
    return this.usersService.updateOnlineStatus(id, isOnline);
  }
}
