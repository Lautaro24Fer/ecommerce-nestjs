import { Module } from '@nestjs/common';
import { IdTypeService } from './id-type.service';
import { IdTypeController } from './id-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdType } from './entities/id-type.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [IdTypeController],
  providers: [IdTypeService],
  imports: [
    TypeOrmModule.forFeature([IdType]),
    ConfigModule,
    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
    }),
  }),
  ],
  exports: [IdTypeService, TypeOrmModule]
})
export class IdTypeModule {}
