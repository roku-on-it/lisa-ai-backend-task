import { Test, TestingModule } from '@nestjs/testing';
import { SessionManager } from './session-manager';
import { AppRedisService } from '../misc/app-redis/app-redis.service';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let appRedisServiceMock: jest.Mocked<AppRedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionManager,
        {
          provide: AppRedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    sessionManager = module.get<SessionManager>(SessionManager);
    appRedisServiceMock = module.get(
      AppRedisService,
    ) as jest.Mocked<AppRedisService>;
  });

  it('should be defined', () => {
    expect(sessionManager).toBeDefined();
  });

  describe('setUserSession', () => {
    it('should set a user session in Redis', async () => {
      const token = 'test-token';
      const userId = 'user-123';

      await sessionManager.setUserSession(token, userId);

      expect(appRedisServiceMock.set).toHaveBeenCalledWith(
        'sessions:test-token',
        userId,
      );
    });
  });

  describe('getUserId', () => {
    it('should get a user ID from Redis', async () => {
      const token = 'test-token';
      const userId = 'user-123';

      appRedisServiceMock.get.mockResolvedValue(userId);

      const result = await sessionManager.getUserId(token);

      expect(appRedisServiceMock.get).toHaveBeenCalledWith(
        'sessions:test-token',
      );
      expect(result).toBe(userId);
    });

    it('should return null if session does not exist', async () => {
      const token = 'non-existent-token';

      appRedisServiceMock.get.mockResolvedValue(null);

      const result = await sessionManager.getUserId(token);

      expect(appRedisServiceMock.get).toHaveBeenCalledWith(
        'sessions:non-existent-token',
      );
      expect(result).toBeNull();
    });
  });

  describe('deleteUserSession', () => {
    it('should delete a user session from Redis', async () => {
      const token = 'test-token';

      await sessionManager.deleteUserSession(token);

      expect(appRedisServiceMock.del).toHaveBeenCalledWith(
        'sessions:test-token',
      );
    });
  });
});
