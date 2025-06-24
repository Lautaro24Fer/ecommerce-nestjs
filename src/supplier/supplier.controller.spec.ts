import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { IRecourseUpdated } from '../global/responseInterfaces';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: SupplierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
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
          provide: SupplierService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
    service = module.get<SupplierService>(SupplierService);
  });

  describe('create', () => {
    it('should create a supplier successfully', async () => {
      const createSupplierDto: CreateSupplierDto = { /* fill with necessary fields */ } as unknown as CreateSupplierDto;
      const createdSupplier: Supplier = { /* fill with necessary fields */ } as unknown as Supplier;
      jest.spyOn(service, 'create').mockResolvedValue({ status: true, message: '', recourse: createdSupplier });

      expect(await controller.create(createSupplierDto)).toEqual({ status: true, message: '', recourse: createdSupplier });
    });

    it('should throw BadRequestException if creation fails', async () => {
      const createSupplierDto: CreateSupplierDto = { /* fill with necessary fields */ } as unknown as CreateSupplierDto;
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException());

      await expect(controller.create(createSupplierDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of suppliers', async () => {
      const suppliers: Supplier[] = [/* fill with necessary fields */];
      jest.spyOn(service, 'findAll').mockResolvedValue({ status: true, message: '', recourse: suppliers });

      expect(await controller.findAll()).toEqual({ status: true, message: '', recourse: suppliers });
    });

    it('should throw BadRequestException if loading fails', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new BadRequestException());

      await expect(controller.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by ID', async () => {
      const supplier: Supplier = { /* fill with necessary fields */ } as unknown as Supplier;
      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: supplier });

      expect(await controller.findOne(1)).toEqual({ status: true, message: '', recourse: supplier });
    });

    it('should throw NotFoundException if supplier is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if loading fails', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException());

      await expect(controller.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a supplier successfully', async () => {
      const updateSupplierDto: UpdateSupplierDto = { /* fill with necessary fields */ } as unknown as UpdateSupplierDto;
      const updatedSupplier: Supplier = { /* fill with necessary fields */ } as unknown as Supplier;

      const serviceResult: IRecourseUpdated<Supplier> = {
        status: true,
        message: '',
        recourse: updatedSupplier
      };

      const controllerResult: IRecourseUpdated<UpdateSupplierDto> = {
        status: true,
        message: '',
        recourse: updateSupplierDto
      };

      jest.spyOn(service, 'update').mockResolvedValue(serviceResult);

      expect(await controller.update(1, updateSupplierDto)).toEqual(controllerResult);
    });

    it('should throw NotFoundException if supplier is not found', async () => {
      const updateSupplierDto: UpdateSupplierDto = { /* fill with necessary fields */ } as unknown as UpdateSupplierDto;
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, updateSupplierDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if update fails', async () => {
      const updateSupplierDto: UpdateSupplierDto = { /* fill with necessary fields */ } as unknown as Supplier;
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException());

      await expect(controller.update(1, updateSupplierDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a supplier successfully', async () => {
      const removedSupplier: Supplier = { /* fill with necessary fields */ } as unknown as Supplier;
      jest.spyOn(service, 'remove').mockResolvedValue({ status: true, message: '', recourse: removedSupplier });

      expect(await controller.remove(1)).toEqual({ status: true, message: '', recourse: removedSupplier });
    });

    it('should throw NotFoundException if supplier is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if removal fails', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new BadRequestException());

      await expect(controller.remove(1)).rejects.toThrow(BadRequestException);
    });
  })
});