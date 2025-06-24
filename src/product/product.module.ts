import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { BrandModule } from '../brand/brand.module';
import { SupplierModule } from '../supplier/supplier.module';
import { TypeModule } from '../type/type.module';
import { ImagesModule } from '../images/images.module';
import { FtpModule } from '../ftp/ftp.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [TypeOrmModule.forFeature([Product]), 
  forwardRef(() => ImagesModule),
  BrandModule, 
  SupplierModule, 
  TypeModule,
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
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
