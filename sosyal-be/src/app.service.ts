import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Sosyal Backend API is running! 🚀';
  }
}
