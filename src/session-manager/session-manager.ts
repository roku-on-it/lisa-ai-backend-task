import { Injectable } from '@nestjs/common';
import { AppRedisService } from '../misc/app-redis/app-redis.service';

@Injectable()
export class SessionManager {
  constructor(private redis: AppRedisService) {}

  async setUserSession(token: string, userId: string): Promise<void> {
    await this.redis.set('sessions:' + token, userId);
  }

  async getUserId(token: string): Promise<string> {
    return this.redis.get('sessions:' + token);
  }

  async deleteUserSession(token: string): Promise<void> {
    await this.redis.del('sessions:' + token);
  }
}
