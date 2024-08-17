import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyReward } from './daily-reward.model';
import { UserRepository } from '../user/user.repository';
import { AppRedisService } from '../misc/app-redis/app-redis.service';

export interface IDailyRewardRepo {}

@Injectable()
export class DailyRewardRepository implements IDailyRewardRepo, OnModuleInit {
  //Storing the daily rewards in a map for quick access by day index
  private resultCache: Map<number, DailyReward> = new Map();

  constructor(
    @InjectRepository(DailyReward) private repo: Repository<DailyReward>,
    private userRepo: UserRepository,
    private redis: AppRedisService,
  ) {}

  onModuleInit() {
    this.redis
      .getObj<Pick<DailyReward, 'id' | 'coin' | 'dayIndex'>[]>(
        'obj_cache:daily-rewards',
      )
      .then((val) => {
        val.forEach((v) => {
          this.resultCache.set(v.dayIndex, new DailyReward(v));
        });
      })
      .catch(async (err) => {
        // key not found
        if (err.message.endsWith('null')) {
          const count = await this.repo.count();
          if (count === 0) {
            await this.seed();
          }

          const res = await this.repo.find({
            order: {
              dayIndex: 'ASC',
            },
          });

          await this.redis.setObj<DailyReward[]>(
            'obj_cache:daily-rewards',
            res,
          );

          res.forEach((r) => {
            this.resultCache.set(r.dayIndex, r);
          });
        } else {
          throw err;
        }
      });
  }

  async daysCount(): Promise<number> {
    if (this.resultCache.size === 0) {
      await this.seed();
    }

    return this.resultCache.size;
  }

  // Returns a map of day index to daily reward
  listDays(): Map<number, DailyReward> {
    return this.resultCache;
  }

  private async seed() {
    const count = await this.repo.count();

    if (count > 0) {
      return;
    }

    const arr: DailyReward[] = [
      new DailyReward({
        coin: 10,
        dayIndex: 1,
      }),
      new DailyReward({
        coin: 25,
        dayIndex: 2,
      }),
      new DailyReward({
        coin: 40,
        dayIndex: 3,
      }),
      new DailyReward({
        coin: 55,
        dayIndex: 4,
      }),
      new DailyReward({
        coin: 70,
        dayIndex: 5,
      }),
      new DailyReward({
        coin: 85,
        dayIndex: 6,
      }),
      new DailyReward({
        coin: 100,
        dayIndex: 7,
      }),
    ];

    await this.repo.insert(arr);
  }
}
