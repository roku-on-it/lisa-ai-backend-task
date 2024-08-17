import { Module } from '@nestjs/common';
import { AppRedisService } from './app-redis.service';

@Module({
  providers: [AppRedisService],
  exports: [AppRedisService],
})
export class AppRedisModule {}
