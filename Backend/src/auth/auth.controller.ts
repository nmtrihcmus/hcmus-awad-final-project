import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Param,
  Post,
  Render,
  Req,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dto/user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as useragent from 'express-useragent';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(
    @Body(new ValidationPipe({ transform: true })) userData: CreateUserDto,
  ): Promise<string> {
    const newUser = await this.authService.signUp(userData);
    await this.authService.sendActivationEmail(newUser);
    return 'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.';
  }
  @Get('active/:token')
  async activateAccount(@Param('token') token: string): Promise<string> {
    const user_email = await this.authService.activateAccount(token);
    if (user_email) {
      await this.authService.sendWelcomeEmail(user_email);
      return 'Tài khoản đã được kích hoạt';
    } else {
      return 'Lỗi kích hoạt tài khoản';
    }
  }
  @Post('forgot-password')
  async forgotPassword(
    @Body(new ValidationPipe({ transform: true })) userData: ForgotPasswordDto,
  ) {
    const userInfo = await this.authService.forgotPassword(userData.userEmail);
    await this.authService.sendForgotPasswordEmail(userInfo);
    return userInfo;
  }
  @Get('reset-password/:resetToken')
  @Render('reset-password')
  async goToResetPasswordPage(@Param('resetToken') resetToken: string) {
    const userInfo = await this.authService.extractToken(resetToken);
    return { username: userInfo.username };
  }
  @Post('reset-password/:username')
  async resetPassword(
    @Body(new ValidationPipe({ transform: true })) userData: ResetPasswordDto,
    @Param('username') username: string,
    @Req() req: Request,
    @Ip() ip: any,
  ) {
    const result = await this.authService.resetPassword(
      username,
      userData.newPassword,
    );
    if (result) {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      };
      const dateTime = new Date().toLocaleString('vi-VN', options);
      const agent = JSON.stringify(useragent.parse(req.headers['user-agent']));
      const contextData = {
        username,
        resetDateTime: dateTime,
        userAgent: agent,
        clientIP: ip,
      };
      await this.authService.sendResetPasswordSuccessfullyMail(contextData);
      throw new HttpException('Reset password successfully', HttpStatus.OK);
    }
    throw new HttpException('Reset password fail', HttpStatus.BAD_REQUEST);
  }
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body(new ValidationPipe({ transform: true })) signInData: SignInDto) {
    return this.authService.signIn(signInData.username, signInData.password);
  }
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<UserDto> {
    const { username } = req.user;
    const user = await this.usersService.findOneByUsername(username);
    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      gender: user.gender,
      birthday: user.birthday,
      avatar: user.avatar,
    };
  }
}
