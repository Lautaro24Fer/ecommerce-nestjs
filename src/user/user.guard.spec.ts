import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResetUserPasswordGuard } from './user.guard'

describe('ResetUserPasswordGuard', () => {
  let guard: ResetUserPasswordGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetUserPasswordGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<ResetUserPasswordGuard>(ResetUserPasswordGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should allow access when JWT is valid', async () => {
    const mockRequest = {
      cookies: {
        'password-reset': 'valid-jwt',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 1 });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when JWT is missing', async () => {
    const mockRequest = {
      cookies: {},
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'No jwt in request' }),
    );
  });

  it('should throw UnauthorizedException when JWT is expired', async () => {
    const mockRequest = {
      cookies: {
        'password-reset': 'expired-jwt',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue({ name: 'TokenExpiredError' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'The jwt is expired' }),
    );
  });

  it('should throw UnauthorizedException when JWT is invalid', async () => {
    const mockRequest = {
      cookies: {
        'password-reset': 'invalid-jwt',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'The jwt is invalid' }),
    );
  });
  it('should throw UnauthorizedException when JWT_SECRET is missing', async () => {
    const mockRequest = {
      cookies: {
        'password-reset': 'valid-jwt',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;
  
    jest.spyOn(configService, 'get').mockReturnValue(undefined);
  
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'The jwt is invalid' }),
    );
  });

  it('should handle unexpected errors during token verification', async () => {
    const mockRequest = {
      cookies: {
        'password-reset': 'valid-jwt',
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Unexpected error'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException({ error: 'The jwt is invalid' }),
    );
  });

  it('should handle non-HTTP requests gracefully', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => null,
      }),
    } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should not modify the password-reset cookie unexpectedly', async () => {
    const originalToken = 'valid-jwt';
    const mockRequest = {
      cookies: {
        'password-reset': originalToken,
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 1 });

    await guard.canActivate(context);
    expect(mockRequest.cookies['password-reset']).toBe(originalToken);
  });
});