import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            userType: any;
            city: any;
            isOnline: boolean;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): any;
}
