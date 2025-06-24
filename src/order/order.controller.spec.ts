import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { IRecourseCreated, IRecourseFound, IRecourseDeleted } from '../global/responseInterfaces';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { Order } from './entities/order.entity';
import { User } from '../user/entities/user.entity';
import { IdType } from '../id-type/entities/id-type.entity';
import { Address } from '../address/entities/address.entity';
import { Request } from 'express';
import { RequestBodyObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
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
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOrdersByUserId: jest.fn(),
            findOneById: jest.fn(),
            remove: jest.fn(),
            mapOrderToOrderDto: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {
            sendEmailForOrder: jest.fn().mockResolvedValue({
              status: true,
              message: 'The order mail was sent successfully to the admin',
              recourse: {},
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
    jwtService = module.get<JwtService>(JwtService);
  });

  function getJwtToken(payload: any, timeToExpire: string): string {
    return jwtService.sign(payload, { expiresIn: timeToExpire });
  }

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = { /* datos del DTO */ } as unknown as CreateOrderDto;
      const order = new Order(); // Crea una instancia de Order
      order.id = 1; // Asegúrate de establecer las propiedades necesarias
  
      const expectedResponse: IRecourseCreated<OrderDto> = {
        status: true,
        message: 'The order was created succesfully',
        recourse: {
          user: {
            id: 0,
            name: '',
            surname: '',
            username: '',
            phone: '',
            idType: new IdType,
            idNumber: '',
            address: [],
            email: '',
            method: '',
            roles: []
          }, // Asegúrate de que esto coincida con el mapeo esperado
          destination: {
            id: 0,
            postalCode: '',
            addressStreet: '',
            addressNumber: '',
            user: []
          },
          paymentId: '1',
          items: [],
          netPrice: 0,
          IVA: 0.21,
          total: 0,
          profit: 0,
        },
      };
  
      jest.spyOn(orderService, 'create').mockResolvedValue({
        status: true,
        message: 'The order was created succesfully',
        recourse: order,
      });
  
      jest.spyOn(orderService, 'mapOrderToOrderDto').mockReturnValue(expectedResponse.recourse);
  
      const result = await controller.create(createOrderDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should find all orders', async () => {
      const queryParams: QueryParamsDto = { minDate: '2023-01-01', maxDate: '2023-12-31' };
      const expectedResponse: IRecourseFound<Order[]> = {
        status: true,
        message: 'The orders was found succesfully',
        recourse: []
      };

      jest.spyOn(orderService, 'findAll').mockResolvedValue(expectedResponse);

      const result = await controller.findAll(queryParams);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUserOrders', () => {
    it('should get all orders of a user by id', async () => {

      const req: Request = { cookies: {} } as unknown as Request;

      const cookieCrypted: string = getJwtToken({ id: 1 }, '5m');
      req.cookies['user'] = cookieCrypted;

      const userId = 1;
      const expectedResponse: IRecourseFound<Order[]> = {
        status: true,
        message: '',
        recourse: []
      };

      jest.spyOn(orderService, 'findOrdersByUserId').mockResolvedValue(expectedResponse);

      const result = await controller.getUserOrders(userId, req);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException if user ID does not match token ID', async () => {
      const req: Request = { cookies: {} } as unknown as Request;
  
      const userId = 2; // Different from the ID in the token
      const cookieCrypted: string = getJwtToken({ id: 1, roles: ['user'] }, '5m');
      req.cookies['user'] = cookieCrypted;
  
      await expect(controller.getUserOrders(userId, req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('should find one order by id', async () => {
      const orderId = 1;
      const order = new Order(); // Crea una instancia de Order
      order.id = orderId; // Asegúrate de establecer las propiedades necesarias
  
      const expectedResponse: IRecourseFound<OrderDto> = {
        status: true,
        message: 'The order was found successfully',
        recourse: {
          user: {
            id: 0,
            name: '',
            surname: '',
            username: '',
            phone: '',
            idType: new IdType,
            idNumber: '',
            address: [],
            email: '',
            method: '',
            roles: []
          },
          destination: {
            id: 0,
            postalCode: '',
            addressStreet: '',
            addressNumber: '',
            user: []
          },
          paymentId: '1',
          items: [],
          netPrice: 0,
          IVA: 0.21,
          total: 0,
          profit: 0,
        },
      };
  
      jest.spyOn(orderService, 'findOneById').mockResolvedValue({
        status: true,
        message: 'The order was found successfully',
        recourse: order,
      });
  
      jest.spyOn(orderService, 'mapOrderToOrderDto').mockReturnValue(expectedResponse.recourse);
  
      const result = await controller.findOne(orderId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('remove', () => {
    it('should delete an order by id', async () => {
      const orderId = 1;
      const order = new Order(); // Crea una instancia de Order
      order.id = orderId; // Asegúrate de establecer las propiedades necesarias
      order.paymentId = '1';
      order.netPrice = 0;
      order.IVA = 0.21;
      order.total = 0;
      order.profit = 0;
      order.address = {
        id: 0,
        postalCode: '',
        addressStreet: '',
        addressNumber: '',
        user: []
      } as unknown as Address;
      order.user = {
        id: 0,
        name: '',
        surname: '',
        username: '',
        phone: '',
        idType: new IdType(),
        idNumber: '',
        address: [],
        email: '',
        method: '',
        roles: []
      } as unknown as User;
      order.productOrder = [];
  
      const expectedResponse: IRecourseDeleted<OrderDto> = {
        status: true,
        message: 'The order was deleted successfully',
        recourse: {
          user: {
            id: 0,
            name: '',
            surname: '',
            username: '',
            phone: '',
            idType: new IdType(),
            idNumber: '',
            address: [],
            email: '',
            method: '',
            roles: []
          },
          destination: {
            id: 0,
            postalCode: '',
            addressStreet: '',
            addressNumber: '',
            user: []
          },
          paymentId: '1',
          items: [],
          netPrice: 0,
          IVA: 0.21,
          total: 0,
          profit: 0,
        },
      };
  
      jest.spyOn(orderService, 'remove').mockResolvedValue({
        status: true,
        message: 'The order was deleted successfully',
        recourse: order,
      });
  
      jest.spyOn(orderService, 'mapOrderToOrderDto').mockReturnValue(expectedResponse.recourse);
  
      const result = await controller.remove(orderId);
      expect(result).toEqual(expectedResponse);
    });
  });
});