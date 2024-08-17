import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserMustAuthorizeGuard } from '../user/guard/user-must-authorize-guard.service';
import { RequestWithState } from '../shared/type/request';
import { ClaimRewardBody } from './input/claim-reward';
import { DailyRewardService } from './daily-reward.service';

@Controller('daily-reward')
export class DailyRewardController {
  constructor(private dailyRewardService: DailyRewardService) {}

  @UseGuards(UserMustAuthorizeGuard)
  @Get('days')
  async getDays(@Req() req: RequestWithState) {
    return this.dailyRewardService.listDaysForUser(req.session.userId);
  }

  @UseGuards(UserMustAuthorizeGuard)
  @Post('claim')
  async claim(@Body() body: ClaimRewardBody, @Req() req: RequestWithState) {
    return this.dailyRewardService.claimReward(
      req.session.userId,
      body.dayIndex,
    );
  }
}
