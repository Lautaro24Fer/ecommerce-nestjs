import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ProductService } from '../product/product.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { OrderService } from '../order/order.service';
import { UserService } from '../user/user.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoginMethodType } from '../global/enum';
import { IdType } from '../id-type/entities/id-type.entity';
import { IRecourseFound } from '../global/responseInterfaces';
import { User } from '../user/entities/user.entity';
import { IPaymentPreference } from './dto/preference-payment';

describe('PaymentService', () => {
  let service: PaymentService;
  let productService: ProductService;
  let res: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'DEV_CLIENT_DOMAIN':
                  return 'http://localhost';
                case 'MP_ACCESS_TOKEN':
                  return 'test_access_token';
                case 'MP_PUBLIC_KEY':
                  return 'test_public_key';
                case 'MP_CLIENT_ID':
                  return 'test_client_id';
                case 'MP_CLIENT_SECRET':
                  return 'test_client_secret';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: ProductService,
          useValue: {
            validateOperation: jest.fn().mockResolvedValue({ status: true }),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneById: jest.fn().mockResolvedValue({ recourse: { address: [] } }),
          },
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: OrderService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    productService = module.get<ProductService>(ProductService);
    res = { json: jest.fn() };
  });

  it('should call createPaymentPreference when operation is valid', async () => {
    const preferenceData = { items: [], userId: 1, addressId: 1 };
    const createPaymentPreferenceSpy = jest.spyOn(service, 'createPaymentPreference').mockImplementation();

    await service.generatePaymentOrException(preferenceData, res as Response);

    expect(createPaymentPreferenceSpy).toHaveBeenCalledWith(preferenceData, res);
  });

  it('should not call createPaymentPreference when operation is invalid', async () => {
    jest.spyOn(productService, 'validateOperation').mockResolvedValue({ status: false, message: '', recourse: null });
    const preferenceData = { items: [], userId: 1, addressId: 1 };
    const createPaymentPreferenceSpy = jest.spyOn(service, 'createPaymentPreference').mockImplementation();
  
    await service.generatePaymentOrException(preferenceData, res as Response);
  
    expect(createPaymentPreferenceSpy).not.toHaveBeenCalled();
  });

  it('should handle exceptions from validateOperation', async () => {
    jest.spyOn(productService, 'validateOperation').mockRejectedValue(new Error('Validation error'));
    const preferenceData = { items: [], userId: 1, addressId: 1 };
  
    await expect(service.generatePaymentOrException(preferenceData, res as Response)).rejects.toThrow('Validation error');
  });

  /*

  it('should create payment preference successfully', async () => {
    const preferenceData: IPaymentPreference = {
      items: [{
        id: 1,
        quantity: 1,
        title: 'Product Title',
        currency_id: 'USD',
        description: 'Product Description',
        category_id: 'Category ID',
        unit_price: 100.0,
      }],
      userId: 1,
      addressId: 1,
    } as unknown;
    const mockInitPoint = 'http://mock-init-point.com';
  
    // Mock the Preference instance and its create method
    const preferenceMock = {
      create: jest.fn().mockResolvedValue({ init_point: mockInitPoint }),
    };
  
    // Sobrescribe directamente la propiedad `client`
    (service as any).client = preferenceMock;
  
    const mocked: IRecourseFound<User> = {
      recourse: { address: [{
        id: 1, addressStreet: 'Street', addressNumber: '123', postalCode: '00000',
        user: []
      }] },
    } as unknown as IRecourseFound<User>;

    // Mock userService to return a valid address
    jest.spyOn(service['userService'], 'findOneById').mockResolvedValue(mocked);
  
    await service.createPaymentPreference(preferenceData, res as Response);
  
    expect(preferenceMock.create).toHaveBeenCalledWith(expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      message: 'The embeded form was created succesfully',
      recourse: mockInitPoint,
    });
  });
  
  
  

  

  it('should throw NotFoundException if address is not found', async () => {
    const preferenceData = {
      items: [{
        id: 1,
        quantity: 1,
        title: 'Product Title',
        currency_id: 'USD',
        description: 'Product Description',
        category_id: 'Category ID',
        unit_price: 100.0
      }],
      userId: 1,
      addressId: 999
    };
  
    jest.spyOn(service.userService, 'findOneById').mockResolvedValue({
      recourse: { address: [] }
    });
  
    await expect(service.createPaymentPreference(preferenceData, res as Response)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException on preference creation error', async () => {
    const preferenceData = {
      items: [{
        id: 1,
        quantity: 1,
        title: 'Product Title',
        currency_id: 'USD',
        description: 'Product Description',
        category_id: 'Category ID',
        unit_price: 100.0
      }],
      userId: 1,
      addressId: 1
    };
  
    // Mock the Preference instance and its create method to throw an error
    jest.spyOn(service.client, 'create').mockRejectedValue(new Error('Creation error'));
  
    await expect(service.createPaymentPreference(preferenceData, res as Response)).rejects.toThrow(BadRequestException);
  });

  */
});