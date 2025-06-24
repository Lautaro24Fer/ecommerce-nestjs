import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResetUserPasswordGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!request) {
      return false; // O lanza una excepción si prefieres
    }

    if (!jwtSecret) {
      throw new UnauthorizedException({ error: 'The jwt is invalid' });
    }

    const token = request?.cookies['password-reset'];
    if (!token) {
      throw new UnauthorizedException({ error: 'No jwt in request' });
    }

    try {
      await this.jwtService.verifyAsync(token, { secret: jwtSecret });
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({ error: 'The jwt is expired' });
      }
      throw new UnauthorizedException({ error: 'The jwt is invalid' });
    }
  }
}