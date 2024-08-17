import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { RewardClaimState } from './daily-reward.model';
import { DateTime } from 'luxon';
import { DailyRewardRepository } from './daily-reward.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class DailyRewardService {
  constructor(
    private repo: DailyRewardRepository,
    private userRepo: UserRepository,
  ) {}

  async listDaysForUser(userId: string) {
    const user = await this.userRepo.findOneByOrFail({ id: userId });

    const days = this.repo.listDays();

    return Array.from(days.values()).map((day) => {
      const today = DateTime.local({ zone: user.timezone });
      const startOfToday = today.startOf('day');

      // if day.dayIndex is 3 and current index is also 3, then the day is today, so we add 0 days.
      // on the other hand, if day is 1 and current index is 3, the difference is 2 days, so I add negative 2 days
      const diff = day.dayIndex - user.currentClaimDayIdx;

      return {
        title: `Day ${day.dayIndex}`,
        coin: day.coin,
        claimStartDate: startOfToday.plus({ days: diff }),
        claimEndDate: startOfToday.plus({ days: diff }).endOf('day'),
        state:
          user.currentClaimDayIdx === day.dayIndex
            ? RewardClaimState.CLAIMABLE
            : user.currentClaimDayIdx > day.dayIndex
              ? RewardClaimState.CLAIMED
              : RewardClaimState.LOCKED,
      };
    });
  }

  async claimReward(userId: string, dayIndex: number) {
    const user = await this.userRepo.findOneByOrFail({
      id: userId,
    });

    if (user.currentClaimDayIdx < dayIndex) {
      throw new UnprocessableEntityException(
        'Cannot claim reward of future days',
      );
    }

    if (user.currentClaimDayIdx > dayIndex) {
      throw new UnprocessableEntityException('Reward already claimed');
    }

    const offset = DateTime.local().setZone(user.timezone).offset;

    const lowerLimit = DateTime.fromJSDate(user.cannotClaimBeforeAt)
      .plus({
        minutes: -offset,
      })
      .toUTC(0, { keepLocalTime: true });

    const now = DateTime.utc();

    const upperLimit = DateTime.fromJSDate(user.cannotClaimAfterAt)
      .plus({
        minutes: -offset,
      })
      .toUTC(0, { keepLocalTime: true });

    if (now < lowerLimit) {
      throw new UnprocessableEntityException(
        'Time to claim reward has yet to come',
      );
    }

    if (now > upperLimit) {
      await this.userRepo.findByIdAndUpdateOrFail({
        id: userId,
        update: {
          currentClaimDayIdx: 1,
          // @ts-ignore
          cannotClaimBeforeAt: DateTime.local().minus({ weeks: 1 }),
          // @ts-ignore
          cannotClaimAfterAt: DateTime.local().plus({ years: 100 }),
        },
      });

      throw new UnprocessableEntityException(
        'The reward claim day has been reset to 1. ' +
          'Client should change the "dayIndex" to 1 and re-send the request',
        'Reward was not claimed in time',
      );
    }

    const day = this.repo.listDays().get(dayIndex);

    const date1 = DateTime.local({ zone: user.timezone }).plus({ days: 1 });

    const dayMod = user.currentClaimDayIdx % (await this.repo.daysCount());

    await this.userRepo.findByIdAndUpdateOrFail({
      id: userId,
      update: {
        currentClaimDayIdx: dayMod + 1,
        // @ts-ignore
        cannotClaimBeforeAt: date1.startOf('day'),
        // @ts-ignore
        cannotClaimAfterAt: date1.endOf('day'),
        coin: user.coin + day.coin,
      },
    });

    return {
      status: 'success',
      message: `Successfully claimed the reward of day ${dayIndex}`,
    };
  }
}
