import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionManager } from '../../session-manager/session-manager';
import { UserMustAuthorizeGuard } from './user-must-authorize-guard.service';

describe('UserMustAuthorizeGuard', () => {
  let guard: UserMustAuthorizeGuard;
  let sessionManagerMock: jest.Mocked<SessionManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMustAuthorizeGuard,
        {
          provide: SessionManager,
          useValue: {
            getUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UserMustAuthorizeGuard>(UserMustAuthorizeGuard);
    sessionManagerMock = module.get(
      SessionManager,
    ) as jest.Mocked<SessionManager>;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: jest.Mocked<ExecutionContext>;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
        session: {},
      };
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as jest.Mocked<ExecutionContext>;
    });

    it('should throw UnauthorizedException if no authorization header is present', async () => {
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if sessionManager.getUserId returns null', async () => {
      mockRequest.headers.authorization = 'token';
      sessionManagerMock.getUserId.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should set userId in request.session and return true for valid authorization', async () => {
      const userId = '123';
      mockRequest.headers.authorization = 'token';
      sessionManagerMock.getUserId.mockResolvedValue(userId);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.session.userId).toBe(userId);
    });
  });
});
