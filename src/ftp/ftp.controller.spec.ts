import { Test, TestingModule } from '@nestjs/testing';
import { FtpController } from './ftp.controller';
import { FtpService } from './ftp.service';
import { ConfigService } from '@nestjs/config';

describe('FtpController', () => {
  let controller: FtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FtpController],
      providers: [FtpService, ConfigService],
    }).compile();

    controller = module.get<FtpController>(FtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
