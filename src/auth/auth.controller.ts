import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterSuperadminDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MasterSuperadminGuard } from './guards/master-superadmin.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { MasterSuperadmin } from './decorators/master-superadmin.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-superadmin')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, MasterSuperadminGuard)
  @MasterSuperadmin()
  async registerSuperadmin(@Body() registerDto: RegisterSuperadminDto) {
    return this.authService.registerSuperadmin(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }
}
