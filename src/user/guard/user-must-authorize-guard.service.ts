import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionManager } from '../../session-manager/session-manager';

@Injectable()
export class UserMustAuthorizeGuard implements CanActivate {
  constructor(private sessionManager: SessionManager) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const userId = await this.sessionManager.getUserId(authHeader);

    if (!userId) {
      throw new UnauthorizedException();
    }

    request.session.userId = userId;

    return true;
  }
}
