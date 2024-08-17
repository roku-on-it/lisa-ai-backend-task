import { Module } from '@nestjs/common';
import { TimezoneService } from './timezone.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [TimezoneService],
  exports: [TimezoneService],
  imports: [
    // Could be changed later to use a different service
    HttpModule.register({
      baseURL: 'http://ip-api.com/json/',
    }),
  ],
})
export class TimezoneModule {}
