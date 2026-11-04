import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ){}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
       forbidNonWhitelisted: true
        })
    )
    async register (
        @Body() registerDto: RegisterDto
    ){
        return this.authService.register(registerDto)
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto
    ){
        return this.authService.login(loginDto)
    }
}
