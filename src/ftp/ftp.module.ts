import { Module } from '@nestjs/common';
import { FtpService } from './ftp.service';
import { FtpController } from './ftp.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [FtpService],
  exports: [FtpService],
  imports: [ConfigModule]
})
export class FtpModule {}
