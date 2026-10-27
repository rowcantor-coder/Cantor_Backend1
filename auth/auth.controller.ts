
import {
  Controller,
  Post,
  Body,
  Inject,
  BadRequestException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,

    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      username?: string;
      password?: string;
    },
  ) {
    if (
      typeof body?.username !== 'string' ||
      !body.username.trim() ||
      typeof body?.password !== 'string' ||
      !body.password
    ) {
      throw new BadRequestException(
        'Username and password are required',
      );
    }

    return this.usersService.createUser(
      body.username.trim(),
      body.password,
    );
  }

  @Post('login')
  async login(
    @Body()
    body: {
      username?: string;
      password?: string;
    },
  ) {
    if (
      typeof body?.username !== 'string' ||
      !body.username.trim() ||
      typeof body?.password !== 'string' ||
      !body.password
    ) {
      throw new BadRequestException(
        'Username and password are required',
      );
    }

    const user = await this.authService.validateUser(
      body.username.trim(),
      body.password,
    );

    if (!user) {
      throw new BadRequestException('Invalid username or password');
    }

    return this.authService.login(user);
  }

  @Post('logout')
  async logout(
    @Body()
    body: {
      userId?: number;
    },
  ) {
    if (
      typeof body?.userId !== 'number' ||
      !Number.isInteger(body.userId) ||
      body.userId <= 0
    ) {
      throw new BadRequestException('A valid userId is required');
    }

    return this.authService.logout(body.userId);
  }

  @Post('refresh')
  async refresh(
    @Body()
    body: {
      refreshToken?: string;
    },
  ) {
    if (
      typeof body?.refreshToken !== 'string' ||
      !body.refreshToken.trim()
    ) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshTokens(body.refreshToken);
  }
}
