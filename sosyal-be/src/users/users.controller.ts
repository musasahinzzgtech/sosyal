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
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserType } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
    console.log('UsersController initialized');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/complete')
  async getUserDetails(@Request() req) {
    console.log('getUserDetails called with user:', req.user);
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    // Get current user's complete profile
    return this.usersService.getUserDetails(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadPhoto(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
      }),
    )
    file: any,
  ) {
    const photoUrl = `/uploads/photos/${file.filename}`;
    await this.usersService.addPhoto(req.user.id, photoUrl);
    return { 
      message: 'Photo uploaded successfully', 
      photoUrl,
      filename: file.filename 
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove-photo/:photoUrl')
  async removePhoto(@Request() req, @Param('photoUrl') photoUrl: string) {
    await this.usersService.removePhoto(req.user.id, photoUrl);
    return { message: 'Photo removed successfully' };
  }

  @Get('test')
  test() {
    console.log('Test route called');
    return { message: 'Users controller is working' };
  }

  @Get('health')
  health() {
    return { status: 'ok', controller: 'UsersController', timestamp: new Date().toISOString() };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('photos', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() photos?: any,
  ) {
    // Handle photo uploads if provided
    let photoUrls: string[] = [];
    if (photos) {
      // If single photo, convert to array
      if (!Array.isArray(photos)) {
        photos = [photos];
      }
      
      // Process each photo
      for (const photo of photos) {
        if (photo) {
          const photoUrl = `/uploads/photos/${photo.filename}`;
          photoUrls.push(photoUrl);
        }
      }
    }

    // Add photo URLs to user data
    const userDataWithPhotos = {
      ...createUserDto,
      photos: photoUrls
    };

    return this.usersService.create(userDataWithPhotos);
  }

  @Post('register-with-photos')
  @UseInterceptors(
    FileInterceptor('photos', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async registerWithPhotos(
    @Body('userData') userDataString: string,
    @UploadedFile() photos?: any,
  ) {
    try {
      // Parse user data from string
      const createUserDto = JSON.parse(userDataString);
      
      // Handle photo uploads if provided
      let photoUrls: string[] = [];
      if (photos) {
        // If single photo, convert to array
        if (!Array.isArray(photos)) {
          photos = [photos];
        }
        
        // Process each photo
        for (const photo of photos) {
          if (photo) {
            const photoUrl = `/uploads/photos/${photo.filename}`;
            photoUrls.push(photoUrl);
          }
        }
      }

      // Add photo URLs to user data
      const userDataWithPhotos = {
        ...createUserDto,
        photos: photoUrls
      };

      return this.usersService.create(userDataWithPhotos);
    } catch (error) {
      throw new Error('Invalid user data format');
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  searchUsers(
    @Query('q') query: string,
    @Query('userType') userType: UserType,
    @Query('city') city: string,
  ) {
    return this.usersService.searchUsers(query, userType, city);
  }

  @Get('service-providers')
  getServiceProviders(
    @Query('city') city: string,
    @Query('businessType') businessType: string,
  ) {
    return this.usersService.getServiceProviders(city, businessType);
  }

  @Get('customers')
  getCustomers(@Query('city') city: string) {
    return this.usersService.getCustomers(city);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Ensure user can only update their own profile
    if (req.user.id !== id) {
      throw new Error('Unauthorized to update this profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Ensure user can only delete their own profile
    if (req.user.id !== id) {
      throw new Error('Unauthorized to delete this profile');
    }
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/online-status')
  updateOnlineStatus(
    @Param('id') id: string,
    @Body('isOnline') isOnline: boolean,
    @Request() req,
  ) {
    // Ensure user can only update their own online status
    if (req.user.id !== id) {
      throw new Error('Unauthorized to update this status');
    }
    return this.usersService.updateOnlineStatus(id, isOnline);
  }
}
