import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Order } from '../order/entities/order.entity';
import { IRecourseCreated } from '../global/responseInterfaces';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let transporterMock: jest.Mocked<nodemailer.Transporter>;

  beforeEach(async () => {
    transporterMock = {
      sendMail: jest.fn(),
    } as any;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(transporterMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'NM_HOST':
                  return 'smtp.example.com';
                case 'NM_PORT':
                  return 587;
                case 'NM_USER':
                  return 'user@example.com';
                case 'NM_PASSWORD':
                  return 'password';
                case 'NM_ADMIN_MAIL':
                  return 'admin@example.com';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('test_sendEmailForOrder_success', async () => {
    const order = new Order();
    transporterMock.sendMail.mockResolvedValue('email sent');

    const result: IRecourseCreated<any> = await service.sendEmailForOrder(order);

    expect(transporterMock.sendMail).toHaveBeenCalled();
    expect(result.status).toBe(true);
    expect(result.message).toBe('The order mail was sended succesfully to the admin');
  });

  it('test_sendEmailForOrder_failure', async () => {
    const order = new Order();
    transporterMock.sendMail.mockRejectedValue(new Error('send mail error'));

    await expect(service.sendEmailForOrder(order)).rejects.toThrow(BadRequestException);
  });

  it('test_sendEmailForResetPassword_success', async () => {
    const token = 123456;
    const toUser = 'user@example.com';
    transporterMock.sendMail.mockResolvedValue('email sent');

    const result: IRecourseCreated<any> = await service.sendEmailForResetPassword(token, toUser);

    expect(transporterMock.sendMail).toHaveBeenCalled();
    expect(result.status).toBe(true);
    expect(result.message).toBe('The reset password mail was sended succesfully');
  });

  it('test_sendEmailForResetPassword_failure', async () => {
    const token = 123456;
    const toUser = 'user@example.com';
    transporterMock.sendMail.mockRejectedValue(new Error('SMTP error'));

    await expect(service.sendEmailForResetPassword(token, toUser)).rejects.toThrow(BadRequestException);
  });
});