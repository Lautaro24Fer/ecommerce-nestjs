import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { BullModule } from '@nestjs/bullmq' 
import { ResendModule, ResendService } from 'nestjs-resend';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
  // DE MANERA MOMENTANEA SE DEJARÁ EL CONTROLADOR DE EMAILS. EN CASO DE NO SER NECESARIO DE BORRARÁ
  providers: [EmailService, ConfigService],
  imports: [ConfigModule],
  exports: [EmailService],
  controllers: []
})
export class EmailModule {}
