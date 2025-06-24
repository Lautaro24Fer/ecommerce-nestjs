import { Controller } from '@nestjs/common';
import { FtpService } from './ftp.service';

@Controller('ftp')
export class FtpController {
  constructor(private readonly ftpService: FtpService) {}
}
