import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InputLoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { LoginMethodType } from '../global/enum';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByUsernameOrEmail: jest.fn(),
            comparePasswords: jest.fn(),
            findOneById: jest.fn()
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('test_validate_credentials_google_login_attempt', async () => {
    const user = new User();
    user.method = LoginMethodType.GOOGLE;
    jest.spyOn(userService, 'findOneByUsernameOrEmail').mockResolvedValue({
      status: true,
      message: "",
      recourse: user
    });

    await expect(authService.validateCredentials('googleuser@example.com', 'password'))
      .rejects
      .toThrow(UnauthorizedException);
  });

  it('test_get_cookie_by_local_auth_valid_credentials', async () => {
    const user = new User();
    user.id = 1;
    user.method = LoginMethodType.LOCAL;
    user.roles = [];
    jest.spyOn(authService, 'validateCredentials').mockResolvedValue(user);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

    const loginDto = new InputLoginDto();
    loginDto.usernameOrEmail = 'user@example.com';
    loginDto.password = 'password';

    const tokens = await authService.getCookieByLocalAuth(loginDto);

    expect(tokens).toHaveProperty('token', 'token');
    expect(tokens).toHaveProperty('refreshToken', 'token');
  });

  it('test_get_session_statue_missing_refresh_token', async () => {
    const sessionState = await authService.getSessionStatue('accessToken', '');

    expect(sessionState.isLogged).toBe(false);
    expect(sessionState.refreshTokenExists).toBe(false);
    expect(sessionState.message).toBe('Session expired. Please login again');
  });

  // ___

  it('test_get_cookie_by_passport_strategy', async () => {
    const user = new User();
    user.id = 1;
    user.method = LoginMethodType.LOCAL;
    user.roles = [];
    jest.spyOn(userService, 'findOneById').mockResolvedValue({
      status: true,
      message: "",
      recourse: user
    });
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
  
    const tokens = await authService.getCookieByPassportStrategy(user);
  
    expect(tokens).toHaveProperty('token', 'token');
    expect(tokens).toHaveProperty('refreshToken', 'token');
  });
  
  it('test_get_jwt_token_or_bad_request_success', async () => {
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
  
    const token = await authService.getJwtTokenOrBadRequest({ id: 1 }, '1m');
  
    expect(token).toBe('token');
  });
  
  it('test_get_jwt_token_or_bad_request_failure', async () => {
    jest.spyOn(jwtService, 'signAsync').mockRejectedValue(new Error('JWT Error'));
  
    await expect(authService.getJwtTokenOrBadRequest({ id: 1 }, '1m'))
      .rejects
      .toThrow(BadRequestException);
  });
  
  it('test_verify_jwt_is_expired_valid', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({} as any);
  
    const isValid = await authService.verifyJwtIsExpired('validToken');
  
    expect(isValid).toBe(true);
  });
  
  it('test_verify_jwt_is_expired_invalid', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('TokenExpiredError'));
  
    const isValid = await authService.verifyJwtIsExpired('expiredToken');
  
    expect(isValid).toBe(false);
  });
  
  it('test_get_token_refreshed', async () => {
    const payload = { id: 1, method: LoginMethodType.LOCAL };
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
    jest.spyOn(authService, 'getJwtTokenOrBadRequest').mockResolvedValue('newAccessToken');
  
    const newAccessToken = await authService.getTokenRefreshed('refreshToken');
  
    expect(newAccessToken).toBe('newAccessToken');
  });
});