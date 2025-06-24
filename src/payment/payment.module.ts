import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { EmailModule } from '../email/email.module';
import { OrderModule } from '../order/order.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, ConfigService],
  imports: [ConfigModule, JwtModule, AuthModule, UserModule, ProductModule, EmailModule, OrderModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' }, //TODO: TIEMPO DE VIDA DEL JWT POR DEFECTO
        global: true,
      }),
    }),
  ]
})
export class PaymentModule {}
