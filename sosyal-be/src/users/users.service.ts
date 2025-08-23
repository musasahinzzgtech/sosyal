import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserType } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email.toLowerCase() 
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const createdUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).select('-password -refreshToken');
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password -refreshToken');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async searchUsers(query: string, userType?: UserType, city?: string): Promise<User[]> {
    let searchQuery: any = { isActive: true };

    if (userType) {
      searchQuery.userType = userType;
    }

    if (city) {
      searchQuery.city = { $regex: city, $options: 'i' };
    }

    if (query) {
      searchQuery.$text = { $search: query };
    }

    return this.userModel.find(searchQuery)
      .select('-password -refreshToken')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(20);
  }

  async updateOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    });
  }

  async getUserDetails(id: string): Promise<User> {
    console.log('getUserDetails service called with ID:', id);
    
    if (!id) {
      throw new NotFoundException('User ID is required');
    }
    
    const user = await this.userModel.findById(id)
      .select('-password -refreshToken')
      .lean();
    
    if (!user) {
      console.log('User not found with ID:', id);
      throw new NotFoundException('User not found');
    }
    
    console.log('User found:', { id: user._id, email: user.email, userType: user.userType });
    
    // Convert ObjectId to string for frontend compatibility
    const userDetails = {
      ...user,
      _id: user._id.toString(),
      id: user._id.toString(), // Add id field for frontend compatibility
      // Ensure all fields have default values if they're undefined
      photos: user.photos || [],
      rating: user.rating || 0,
      reviewCount: user.reviewCount || 0,
      isOnline: user.isOnline || false,
      isVerified: user.isVerified || false,
      isActive: user.isActive !== undefined ? user.isActive : true,
      experience: user.experience || 0,
      businessName: user.businessName || '',
      businessType: user.businessType || '',
      services: user.services || '',
      workingHours: user.workingHours || '',
      priceRange: user.priceRange || '',
      preferences: user.preferences || '',
      phone: user.phone || '',
      city: user.city || '',
      birthDate: user.birthDate || null,
      lastSeen: user.lastSeen || null,
      createdAt: (user as any).createdAt || new Date(),
    };
    
    console.log('Returning user details with ID field:', userDetails.id);
    return userDetails as User;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken });
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken: null });
  }

  async getServiceProviders(city?: string, businessType?: string): Promise<User[]> {
    let query: any = { 
      userType: UserType.ILAN_VEREN, 
      isActive: true 
    };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (businessType) {
      query.businessType = businessType;
    }

    return this.userModel.find(query)
      .select('-password -refreshToken')
      .sort({ rating: -1, reviewCount: -1 });
  }

  async getCustomers(city?: string): Promise<User[]> {
    let query: any = { 
      userType: UserType.MUSTERI, 
      isActive: true 
    };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    return this.userModel.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
  }

  async addPhoto(userId: string, photoUrl: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { photos: photoUrl } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async removePhoto(userId: string, photoUrl: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { photos: photoUrl } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
}
