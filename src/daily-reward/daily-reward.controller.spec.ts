import { Test, TestingModule } from '@nestjs/testing';
import { DailyRewardController } from './daily-reward.controller';
import { DailyRewardService } from './daily-reward.service';
import { UserMustAuthorizeGuard } from '../user/guard/user-must-authorize-guard.service';
import { RequestWithState } from '../shared/type/request';
import { ClaimRewardBody } from './input/claim-reward';
import { DailyReward } from './daily-reward.model';

describe('DailyRewardController', () => {
  let controller: DailyRewardController;
  let service: DailyRewardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyRewardController],
      providers: [
        {
          provide: DailyRewardService,
          useValue: {
            listDaysForUser: jest.fn(),
            claimReward: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(UserMustAuthorizeGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DailyRewardController>(DailyRewardController);
    service = module.get<DailyRewardService>(DailyRewardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDays', () => {
    it('should return list of days for user', async () => {
      const userId = 'testUserId';
      const req = { session: { userId } } as RequestWithState;
      const days: DailyReward[] = [
        new DailyReward({
          dayIndex: 1,
        }),
      ];
      jest.spyOn(service, 'listDaysForUser').mockResolvedValue(days as any);

      const result = await controller.getDays(req);

      expect(service.listDaysForUser).toHaveBeenCalledWith(userId);
      expect(result).toBe(days);
    });
  });

  describe('claim', () => {
    it('should claim reward for user', async () => {
      const userId = 'testUserId';
      const body: ClaimRewardBody = { dayIndex: 1 };
      const req = { session: { userId } } as RequestWithState;
      const reward = {
        message: 'Reward claimed successfully',
        status: 'success',
      };

      jest.spyOn(service, 'claimReward').mockResolvedValue({
        message: 'Reward claimed successfully',
        status: 'success',
      });

      const result = await controller.claim(body, req);

      expect(service.claimReward).toHaveBeenCalledWith(userId, body.dayIndex);
      expect(result).toStrictEqual(reward);
    });
  });
});
