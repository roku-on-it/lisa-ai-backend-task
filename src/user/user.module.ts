import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model';
import { UserController } from './user.controller';
import { SessionManagerModule } from '../session-manager/session-manager.module';
import { TimezoneModule } from '../timezone/timezone.module';

@Module({
  controllers: [UserController],
  // re-exporting typeorm because of this https://docs.nestjs.com/techniques/database#repository-pattern
  imports: [
    TypeOrmModule.forFeature([User]),
    SessionManagerModule,
    TimezoneModule,
  ],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
