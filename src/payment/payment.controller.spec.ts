import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { EmailService } from '../email/email.service';
import { OrderService } from '../order/order.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { IPaymentPreferenceReq } from './dto/preference-payment';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let paymentService: PaymentService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET') ?? 'secret',
        }),
      }),
      ],
      controllers: [PaymentController],
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('some_value'),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneById: jest.fn().mockResolvedValue({ recourse: { address: [] } }),
          },
        },
        {
          provide: ProductService,
          useValue: {
            validateOperation: jest.fn().mockResolvedValue({ status: true }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: OrderService,
          useValue: {
            updateOrderStatus: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    paymentController = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    jwtService = module.get<JwtService>(JwtService);
  });

  function getJwtToken(payload: any, timeToExpire: string): string {
    return jwtService.sign(payload, { expiresIn: timeToExpire });
  }

  describe('createPaymentPreference', () => {
    let res: Response;
    let req: Request;

    beforeEach(() => {
      res = {} as unknown as Response;
      req = { cookies: {} } as unknown as Request;
    });

    it('should create a payment preference successfully', async () => {
      const cookieCrypted: string = getJwtToken({ id: 1 }, '5m');
      req.cookies['user'] = cookieCrypted;
      const mockPreferenceData = { userId: 1, addressId: 1, items: [] } as IPaymentPreferenceReq;
      jest.spyOn(paymentService, 'generatePaymentOrException').mockResolvedValue(undefined);

      await expect(paymentController.createPaymentPreference(mockPreferenceData, req, res)).resolves.toBeUndefined();
    });

    it('should throw BAD_REQUEST when there is an error in the payment preference data', async () => {
      const cookieCrypted: string = getJwtToken({ id: 1 }, '5m');
      req.cookies['user'] = cookieCrypted;
      const mockPreferenceData = { userId: 1, addressId: 1, items: [] } as IPaymentPreferenceReq;
      jest.spyOn(paymentService, 'generatePaymentOrException').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(paymentController.createPaymentPreference(mockPreferenceData, req, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw UNAUTHORIZED when tokens are not provided', async () => {
      const mockPreferenceData = { userId: 1 } as IPaymentPreferenceReq;
      req.cookies['user'] = undefined; // No token
      jest.spyOn(paymentService, 'generatePaymentOrException').mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(paymentController.createPaymentPreference(mockPreferenceData, req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if userId in cookie does not match userId in body', async () => {
      const cookieCrypted: string = getJwtToken({ id: 123 }, '5m');
      req.cookies['user'] = cookieCrypted;
      const paymentPreference = { userId: 456 } as IPaymentPreferenceReq; // Different userId

      await expect(paymentController.createPaymentPreference(paymentPreference, req, res)).rejects.toThrow(UnauthorizedException);
    });
  });
});