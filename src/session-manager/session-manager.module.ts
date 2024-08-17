import { Module } from '@nestjs/common';
import { SessionManager } from './session-manager';
import { AppRedisModule } from '../misc/app-redis/app-redis.module';

@Module({
  imports: [AppRedisModule],
  providers: [SessionManager],
  exports: [SessionManager],
})
export class SessionManagerModule {}
