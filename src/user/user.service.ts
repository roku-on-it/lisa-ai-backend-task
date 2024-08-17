import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { verify } from 'argon2';
import { randomBytes } from 'node:crypto';
import { SessionManager } from '../session-manager/session-manager';
import { TimezoneService } from '../timezone/timezone.service';

type RegisterUserArgs = {
  username: string;
  passwordHash: string;
};

type LoginUserArgs = {
  username: string;
  password: string;
};

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private sessionManager: SessionManager,
    private timezoneService: TimezoneService,
  ) {}

  async registerUser(args: RegisterUserArgs, ip: string): Promise<void> {
    const tz = await this.timezoneService.fromIPV4(ip).catch((err) => {
      console.error(err);
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later',
      );
    });

    await this.userRepo.insertOrFail({
      username: args.username,
      passwordHash: args.passwordHash,
      timezone: tz,
    });
  }

  async loginUser(args: LoginUserArgs): Promise<string> {
    const user = await this.userRepo.findOneByOrFail({
      username: args.username,
    });

    const hashesMatch = await verify(user.passwordHash, args.password);

    if (!hashesMatch) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    const token = randomBytes(32).toString('base64url');

    await this.sessionManager.setUserSession(token, user.id);

    return token;
  }

  async logoutUser(token: string): Promise<void> {
    await this.sessionManager.deleteUserSession(token);
  }
}
