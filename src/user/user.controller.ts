import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserBody } from './input/register-user';
import { UserService } from './user.service';
import { RequestWithState } from '../shared/type/request';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('auth/register')
  async registerUser(
    @Body() body: RegisterUserBody,
    @Req() req: RequestWithState,
  ) {
    let ip = req.header('x-forwarded-for') || req.ip;

    if (ip == null) {
      throw new BadRequestException('Invalid IPv4 address provided');
    }

    if (ip === '::1' || ip.startsWith('::ffff:')) {
      // testing purposes. ip of one of the ubuntu Turkey mirrors
      ip = '5.2.80.47';
    }

    await this.userService.registerUser(
      { username: body.username, passwordHash: body.password },
      ip,
    );
  }

  @Post('auth/login')
  async loginUser(@Body() body: RegisterUserBody) {
    return this.userService
      .loginUser(body)
      .then((token) => ({ token }))
      .catch((error) => {
        if (error instanceof NotFoundException) {
          throw new UnauthorizedException('Invalid credentials provided');
        }

        if (error instanceof UnauthorizedException) {
          throw error;
        }

        throw new UnauthorizedException('Invalid credentials provided');
      });
  }
}
