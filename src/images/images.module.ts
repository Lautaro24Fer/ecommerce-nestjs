import { forwardRef, Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImage } from './entities/image.entity';
import { ProductModule } from '../product/product.module';
import { FtpModule } from '../ftp/ftp.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as path from "path"
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [
    TypeOrmModule.forFeature([ProductImage]), 
    forwardRef(() => ProductModule), 
    MulterModule.register({
      dest: path.resolve('./temp'),
    }),
    FtpModule, 
    ConfigModule,
    JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  exports: [ImagesService, TypeOrmModule],

})
export class ImagesModule {}
