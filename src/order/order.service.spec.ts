import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ProductOrder } from './entities/order.entity';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { MethodPaymentType } from '../global/enum';
import { QueryParamsDto } from './dto/query-params.dto';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { OrderDto } from './dto/order.dto';
import { UserDto } from '../user/dto/user.dto';
import { ProductOrderDto } from './dto/product-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let productOrderRepository: Repository<ProductOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProductOrder),
          useClass: Repository,
        },
        {
          provide: ProductService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ recourse: { isActive: true, stock: 10, price: 100, cost: 50 } }),
            update: jest.fn().mockResolvedValue({ recourse: {} }),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneById: jest.fn().mockResolvedValue({
              status: true,
              message: "",
              recourse: {
                id: 1,
                address: [{ id: 1 }]
              }
            }),
            mapUserToUserDto: jest.fn()
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'MP_ACCESS_TOKEN':
                  return 'test-access-token';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {},
        },
      ],
    }).compile();
  
    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    productOrderRepository = module.get<Repository<ProductOrder>>(getRepositoryToken(ProductOrder));
  });

  describe('verifyStatus', () => {
    it('should return true for test paymentId', async () => {
      const result = await service.verifyStatus(12345);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if paymentId is not found', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ status: 404 }),
        } as Response)
      );

      await expect(service.verifyStatus(99999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on fetch error', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() => Promise.reject(new Error('Fetch error')));

      await expect(service.verifyStatus(99999)).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      // Datos de entrada para el método create 
      const orderData: CreateOrderDto = {
        userId: 1,
        addressId: 1,
        paymentId: 1,
        products: [],
        paymentMethod: MethodPaymentType.MP_TRANSFER,
        IVA: 0.21,
      };

      // Objeto esperado al guardar la orden
      const savedOrder = {
        id: 1,
        paymentId: '1',
        address: { id: 1 } as Address,
        addressId: 1,
        dateCreated: new Date(),
        user: { id: 1, address: [{ id: 1 }] } as User,
        productOrder: [],
        paymentMethod: MethodPaymentType.MP_TRANSFER,
        netPrice: 0,
        IVA: 0.21,
        total: 0,
        profit: 0,
      } as Order;

      // Configuración de mocks
      jest.spyOn(orderRepository, 'create').mockReturnValue(savedOrder);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(savedOrder);
      jest.spyOn(orderRepository, 'existsBy').mockResolvedValue(false);

      // Llamada al método create
      const result = await service.create(orderData);

      // Validación de llamadas
      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentId: '1',
          addressId: 1,
          userId: 1,
          products: [],
          paymentMethod: MethodPaymentType.MP_TRANSFER,
          IVA: 0.21,
        }),
      );
      expect(orderRepository.save).toHaveBeenCalledWith(savedOrder);

      // Validación del resultado final
      expect(result).toEqual({
        status: true,
        message: 'The order was created succesfully',
        recourse: savedOrder,
      });
    });

    it('should throw BadRequestException if paymentId already exists', async () => {
      jest.spyOn(orderRepository, 'existsBy').mockResolvedValue(true);

      const createOrderDto = {
        userId: 1,
        addressId: 1,
        paymentId: 123,
        products: [{ productId: 1, quantity: 1 }],
        paymentMethod: MethodPaymentType.MP_TRANSFER,
      };

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
    });

    // Add more tests for other error cases
  });

  describe('findAll', () => {

    const queryParams: QueryParamsDto = {
      minDate: undefined,
      maxDate: undefined,
      // Add other properties if needed
    };
    it('should return all orders', async () => {
      const mockOrder = {
        id: 1,
        paymentId: '1',
        paymentMethod: 'MP_TRANSFER',
        netPrice: 100,
        IVA: 0.21,
        total: 121,
        profit: 20,
        address: { id: 1 } as Address,
        user: { id: 1 } as User,
        dateCreated: new Date(),
        productOrder: [],
      } as Order;

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOrder]),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(queryParams);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The orders were found successfully');
      expect(result.recourse).toHaveLength(1);
      expect(result.recourse[0]).toEqual(mockOrder);
    });

    it('should apply date filters correctly', async () => {
      const mockOrder = {
        id: 1,
        paymentId: '1',
        paymentMethod: 'MP_TRANSFER',
        netPrice: 100,
        IVA: 0.21,
        total: 121,
        profit: 20,
        address: { id: 1 } as Address,
        user: { id: 1 } as User,
        dateCreated: new Date('2023-01-01T00:00:00Z'),
        productOrder: [],
      } as Order;

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOrder]),
      };

      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const queryParams: QueryParamsDto = {
        minDate: '2023-01-01T00:00:00Z',
        maxDate: '2023-12-31T23:59:59Z',
      };

      const result = await service.findAll(queryParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.dateCreated >= :minDate', { minDate: queryParams.minDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.dateCreated <= :maxDate', { maxDate: queryParams.maxDate });
      expect(result.status).toBe(true);
      expect(result.message).toBe('The orders were found successfully');
      expect(result.recourse).toHaveLength(1);
      expect(result.recourse[0]).toEqual(mockOrder);
    });
    

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(orderRepository, 'find').mockRejectedValue(new Error('DB error'));

      await expect(service.findAll(queryParams)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findProductOrderById', () => {
    it('should return a product order', async () => {
      jest.spyOn(productOrderRepository, 'findOne').mockResolvedValue({} as ProductOrder);

      const result = await service.findProductOrderById(1);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if product order is not found', async () => {
      jest.spyOn(productOrderRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findProductOrderById(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(productOrderRepository, 'findOne').mockRejectedValue(new Error('DB error'));

      await expect(service.findProductOrderById(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneById', () => {
    it('should return an order successfully', async () => {
      const mockOrder = { id: 1, user: { id: 1 }, productOrder: [] } as Order;
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(mockOrder);
      jest.spyOn(service, 'findProductOrderById').mockResolvedValue({} as ProductOrder);
      jest.spyOn(service['userService'], 'findOneById').mockResolvedValue({
        status: true,
        message: "",
        recourse: mockOrder.user
      });

      const result = await service.findOneById(1);
      expect(result.status).toBe(true);
      expect(result.message).toBe('The order was found succesfully');
      expect(result.recourse).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order is not found', async () => {
      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneById(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(orderRepository, 'findOne').mockRejectedValue(new Error('DB error'));

      await expect(service.findOneById(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an order successfully', async () => {
      const mockOrder: Order = { id: 1 } as Order;
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        status: true,
        message: "",
        recourse: mockOrder
      });
      jest.spyOn(orderRepository, 'delete').mockResolvedValue(undefined);

      const result = await service.remove(1);
      expect(result.status).toBe(true);
      expect(result.message).toBe('The recourse was deleted succesfully');
      expect(result.recourse).toEqual(mockOrder);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue({
        status: true,
        message: "",
        recourse: { id: 1 } as Order
      });
      jest.spyOn(orderRepository, 'delete').mockRejectedValue(new Error('DB error'));

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('mapOrderToOrderDto', () => {
    it('should map an order to OrderDto successfully', () => {
      const mockOrder: Order = {
        id: 1,
        user: { id: 1, name: 'John', username: 'john_doe' } as unknown as User,
        address: { id: 1 } as unknown as Address,
        paymentId: '12345',
        productOrder: [{ id: 1, product: {}, quantity: 2 }] as ProductOrder[],
        dateCreated: undefined,
        paymentMethod: 'MP_PAYMENT',
        netPrice: 0,
        IVA: 0,
        total: 0,
        profit: 0
      };

      const mockOrderDto: OrderDto = {
        user: { id: 1, name: 'John', username: 'john_doe' } as unknown as UserDto,
        destination: { id: 1 } as unknown as Address,
        paymentId: '12345',
        items: [{ id: 1, orderId: 1, product: {}, quantity: 2 }] as ProductOrderDto[], // Include orderId here
        netPrice: 0,
        IVA: 0,
        total: 0,
        profit: 0
      };

      jest.spyOn(service['userService'], 'mapUserToUserDto').mockReturnValue(mockOrder.user);

      const result = service.mapOrderToOrderDto(mockOrder);
      expect(result).toEqual(mockOrderDto);
    });
  });
});