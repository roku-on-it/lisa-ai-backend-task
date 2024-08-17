import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AppTypeormModule } from './misc/app-typeorm/app-typeorm.module';
import { AppConfigModule } from './misc/app-config/app-config.module';
import { SessionManagerModule } from './session-manager/session-manager.module';
import { DailyRewardModule } from './daily-reward/daily-reward.module';

@Module({
  imports: [
    AppTypeormModule,
    AppConfigModule,
    UserModule,
    SessionManagerModule,
    DailyRewardModule,
  ],
})
export class AppModule {}
