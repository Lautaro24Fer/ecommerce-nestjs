import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { UserDto } from '../../user/dto/user.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: any, done: Function) {
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user: User = (await this.userService.findOneByEmail(payload.email)).recourse;
    return user ? done(null, user) : done(null, null);
  }
}
