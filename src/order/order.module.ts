import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, ProductOrder } from './entities/order.entity';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    TypeOrmModule.forFeature([Order, ProductOrder]), 
    ProductModule, 
    UserModule, 
    ConfigModule, 
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' }, //TODO: TIEMPO DE VIDA DEL JWT POR DEFECTO
        global: true,
      }),
    }),
  ],
  exports: [TypeOrmModule, OrderService],
})
export class OrderModule {}
