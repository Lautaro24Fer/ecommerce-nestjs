import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { User } from '../../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { LoginMethodType, MethodPaymentType } from '../../global/enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const clientIDVar = configService.get<string>('OAUTH_CLIENT_ID');
    const clientSecretVatr = configService.get<string>('OAUTH_CLIENT_SECRET');
    const callbackURLVar = configService.get<string>(
      'OAUTH_GOOGLE_REDIRECT_URL',
    );

    super({
      clientID: clientIDVar,
      clientSecret: clientSecretVatr,
      callbackURL: callbackURLVar,
      scope: ['profile', 'email'],
    });
  }

  async validate( accessToken: string, refreshToken: string, profile: Profile ): Promise<any> {
    const usernameNull = `username.null.${Date.now() + 1}`;
    const user: User = await this.userService.validateUserWithStrategy({
      name: profile.displayName,
      username: profile.username ?? usernameNull,
      method: LoginMethodType.GOOGLE,
      email: profile.emails[0].value,
      password: '', // Invesigar si se pueden almacenar contraseñas vacías
      surname: profile.name.familyName,
      postalCode: '',
      idNumber: '',
      idType: 1
    });
    return user || null;
  }
}
