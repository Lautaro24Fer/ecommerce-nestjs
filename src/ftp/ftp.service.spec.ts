import { Test, TestingModule } from '@nestjs/testing';
import { FtpService } from './ftp.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import { MulterFile } from '../images/dto/multer-file';

jest.mock('basic-ftp', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      ftp: {
        verbose: false
      },
      access: jest.fn(),
      list: jest.fn(),
      uploadFrom: jest.fn(),
      remove: jest.fn(),
      size: jest.fn(),
      close: jest.fn(),
    })),
  };
});

describe('FtpService', () => {
  let service: FtpService;
  let configService: ConfigService;
  let mockClient: ftp.Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FtpService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'FTP_SERVER':
                  return 'ftp.example.com';
                case 'FTP_USER':
                  return 'user';
                case 'FTP_PASSWORD':
                  return 'password';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FtpService>(FtpService);
    configService = module.get<ConfigService>(ConfigService);
    mockClient = service['client'];
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('test_connect_to_ftp_server_success', async () => {
    mockClient.access = jest.fn().mockResolvedValue({});
    await expect(service.connectToFTPServer()).resolves.not.toThrow();
    expect(mockClient.access).toHaveBeenCalledWith({
      host: 'ftp.example.com',
      user: 'user',
      password: 'password',
      secure: false,
    });
  });

  it('test_save_image_on_ftp_server_file_not_found', async () => {
    const file: MulterFile = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '/tmp',
      filename: 'test.jpg',
      path: '/tmp/test.jpg',
    };

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(service.saveImageOnFTPServer(file)).rejects.toThrow(BadRequestException);
    expect(fs.existsSync).toHaveBeenCalledWith(file.path);
  });

  it('test_check_file_exists_not_found', async () => {
    mockClient.list = jest.fn().mockResolvedValue([]);
    mockClient.access = jest.fn().mockResolvedValue({});
    mockClient.close = jest.fn();

    const result = await service.checkFileExists('nonexistent.txt');
    expect(result).toBe(false);
    expect(mockClient.list).toHaveBeenCalledWith('nonexistent.txt');
  });

  it('should throw BadRequestException on FTP connection error', async () => {
    mockClient.access = jest.fn().mockRejectedValue(new Error('Connection error'));

    await expect(service.connectToFTPServer()).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException on FTP upload error', async () => {
    const localPath = '/tmp/test.jpg';
    const remotePath = 'products/test.jpg';

    mockClient.uploadFrom = jest.fn().mockRejectedValue(new Error('Upload error'));

    await expect(service.uploadFile(localPath, remotePath)).rejects.toThrow(BadRequestException);
  });
});