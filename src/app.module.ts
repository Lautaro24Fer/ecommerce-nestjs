import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { BrandModule } from './brand/brand.module';
import { SupplierModule } from './supplier/supplier.module';
import { OrderModule } from './order/order.module';
import { Brand } from './brand/entities/brand.entity';
import { Order, ProductOrder } from './order/entities/order.entity';
import { Product } from './product/entities/product.entity';
import { Supplier } from './supplier/entities/supplier.entity';
import { User } from './user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductImage } from './images/entities/image.entity';
import { ProductType } from './type/entities/type.entity';
import { TypeModule } from './type/type.module';
import { ImagesModule } from './images/images.module';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { DataSource } from 'typeorm';
import { PaymentModule } from './payment/payment.module';
import { IdTypeModule } from './id-type/id-type.module';
import { IdType } from './id-type/entities/id-type.entity';
import { AddressModule } from './address/address.module';
import { Address } from './address/entities/address.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { FtpModule } from './ftp/ftp.module';
import { CookieMiddleware } from './auth/cookie.middleware';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule,
    ConfigModule.forRoot({ envFilePath: ['./.env'], isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('TYPEORM_DATABASE_HOST'),
        port: +configService.get<string>('TYPEORM_DATABASE_PORT'),
        username: configService.get<string>('TYPEORM_DATABASE_USERNAME'),
        password: configService.get<string>('TYPEORM_DATABASE_PASSWORD'),
        database: configService.get<string>('TYPEORM_DATABASE_NAME'),
        entities: [Brand, Order, Product, Supplier, User, ProductImage, ProductType, ProductOrder, Role, IdType, Address],
        synchronize: false,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    ProductModule,
    BrandModule,
    SupplierModule,
    OrderModule,
    TypeModule,
    ImagesModule,
    RolesModule,
    EmailModule,
    PaymentModule,
    IdTypeModule,
    AddressModule,
    ScheduleModule.forRoot(),
    FtpModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}


// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(CookieMiddleware)
//       .forRoutes('*'); // Apply to all routes
//   }
// }
