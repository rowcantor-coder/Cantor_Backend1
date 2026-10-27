
import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      username: string;
      email: string;
      password: string;
    },
  ) {
    if (
      !body.username?.trim() ||
      !body.email?.trim() ||
      !body.password
    ) {
      throw new UnauthorizedException(
        'Username, email, and password are required',
      );
    }

    const user = await this.usersService.createUser(
      body.username.trim(),
      body.password,
      'user',
      body.email.trim(),
    );

    return {
      message: 'Registration successful',
      user,
    };
  }

  @Post('login')
  async login(
    @Body()
    body: {
      username: string;
      password: string;
    },
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid username or password',
      );
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(
    @Body() body: { refreshToken: string },
  ) {
    if (!body.refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is required',
      );
    }

    return this.authService.refreshTokens(
      body.refreshToken,
    );
  }

  @Post('logout')
  async logout(
    @Body() body: { userId: number },
  ) {
    if (!body.userId) {
      throw new UnauthorizedException(
        'User ID is required',
      );
    }

    return this.authService.logout(body.userId);
  }
}
