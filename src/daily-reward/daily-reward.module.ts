import { Module } from '@nestjs/common';
import { DailyRewardController } from './daily-reward.controller';
import { SessionManagerModule } from '../session-manager/session-manager.module';
import { DailyRewardRepository } from './daily-reward.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyReward } from './daily-reward.model';
import { UserModule } from '../user/user.module';
import { DailyRewardService } from './daily-reward.service';
import { AppRedisModule } from '../misc/app-redis/app-redis.module';

@Module({
  controllers: [DailyRewardController],
  imports: [
    SessionManagerModule,
    TypeOrmModule.forFeature([DailyReward]),
    UserModule,
    AppRedisModule,
  ],
  providers: [DailyRewardRepository, DailyRewardService],
  exports: [DailyRewardRepository, DailyRewardService],
})
export class DailyRewardModule {}
