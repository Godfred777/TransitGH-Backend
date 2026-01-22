import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
//import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guards';
import { LoginDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }
}
