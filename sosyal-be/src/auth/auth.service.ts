import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id.toString(), userType: user.userType };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update user's refresh token
    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);

    // Update online status
    await this.usersService.updateOnlineStatus(user._id.toString(), true);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        city: user.city,
        isOnline: true,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { email: user.email, sub: user._id.toString(), userType: user.userType };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Update refresh token
      await this.usersService.updateRefreshToken(user._id.toString(), newRefreshToken);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    await this.usersService.updateOnlineStatus(userId, false);
    return { message: 'Logged out successfully' };
  }
}
