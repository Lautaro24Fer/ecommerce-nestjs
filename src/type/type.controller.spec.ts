import { Test, TestingModule } from '@nestjs/testing';
import { TypeController } from './type.controller';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { ProductType } from './entities/type.entity';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { UpdateTypeDto } from './dto/update-type.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('TypeController', () => {
  let controller: TypeController;
  let service: TypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeController],
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
          provide: TypeService,
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

    controller = module.get<TypeController>(TypeController);
    service = module.get<TypeService>(TypeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product type', async () => {
      const createTypeDto: CreateTypeDto = { name: 'New Type' };
      const result: IRecourseCreated<ProductType> = {
        status: true,
        message: 'The product type was created successfully',
        recourse: { id: 1, name: 'New Type' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createTypeDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createTypeDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of product types', async () => {
      const result: IRecourseFound<ProductType[]> = {
        status: true,
        message: 'The product types were loaded successfully',
        recourse: [{ id: 1, name: 'Type1' }, { id: 2, name: 'Type2' }],
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product type', async () => {
      const result: IRecourseFound<ProductType> = {
        status: true,
        message: 'The product type was found successfully',
        recourse: { id: 1, name: 'Type1' },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a product type', async () => {
      const updateTypeDto: UpdateTypeDto = { name: 'Updated Type' };
      const result: IRecourseUpdated<ProductType> = {
        status: true,
        message: 'The product type was updated successfully',
        recourse: { id: 1, name: 'Updated Type' },
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateTypeDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(1, updateTypeDto);
    });
  });

  describe('remove', () => {
    it('should delete a product type', async () => {
      const result: IRecourseDeleted<ProductType> = {
        status: true,
        message: 'The product type was deleted successfully',
        recourse: { id: 1, name: 'Deleted Type' },
      };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});