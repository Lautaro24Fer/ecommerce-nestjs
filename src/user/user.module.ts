import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from '../roles/roles.module';
import { EmailModule } from '../email/email.module';
import { IdTypeModule } from '../id-type/id-type.module';
import { AddressModule } from '../address/address.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    RolesModule,
    EmailModule,
    IdTypeModule,
    forwardRef(() => AddressModule),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' }, // TIEMPO DE VIDA DEL JWT
        global: true,
      }),
    }),
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
