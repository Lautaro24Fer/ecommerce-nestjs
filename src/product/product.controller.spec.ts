import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IRecourseUpdated, IRecourseDeleted, IRecourseCreated, IRecourseFound } from '../global/responseInterfaces';
import { MulterFile } from '../images/dto/multer-file';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
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
          provide: ProductService,
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

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto: CreateProductDto = {
        name: '',
        description: '',
        price: 0,
        cost: 0,
        brandId: 0,
        supplierId: 0,
        typeId: 0,
        stock: 0
      };
      const file: MulterFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: '',
        path: ''
      };
      const result: IRecourseCreated<any> = { status: true, message: 'Product created', recourse: {} };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createProductDto, file)).toEqual(result);
    });

    it('should throw BadRequestException if creation fails', async () => {
      const createProductDto: CreateProductDto = {
        name: '',
        description: '',
        price: 0,
        cost: 0,
        brandId: 0,
        supplierId: 0,
        typeId: 0,
        stock: 0
      };
      const file: MulterFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: '',
        path: ''
      };

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException());

      await expect(controller.create(createProductDto, file)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const queryParams: QueryParamsDto = { /* fill with appropriate data */ };
      const result: IRecourseFound<any[]> = { status: true, message: 'Products found', recourse: [] };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(queryParams)).toEqual(result);
    });

    it('should throw BadRequestException if loading fails', async () => {
      const queryParams: QueryParamsDto = { /* fill with appropriate data */ };

      jest.spyOn(service, 'findAll').mockRejectedValue(new BadRequestException());

      await expect(controller.findAll(queryParams)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const id = 1;
      const result: IRecourseFound<any> = { status: true, message: 'Product found', recourse: {} };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 1;

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('partialUpdate', () => {
    it('should update a product partially', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = { /* fill with appropriate data */ };
      const file: MulterFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: '',
        path: ''
      };
      const productUpdated: Product = {} as unknown as Product;
      const result: IRecourseUpdated<any> = { status: true, message: 'Product updated', recourse: productUpdated };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.partialUpdate(id, updateProductDto, file)).toEqual(result);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = { /* fill with appropriate data */ };
      const file: MulterFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: '',
        path: ''
      };

      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.partialUpdate(id, updateProductDto, file)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if update fails', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = { /* fill with appropriate data */ };
      const file: MulterFile = {
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 0,
        destination: '',
        filename: '',
        path: ''
      };

      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException());

      await expect(controller.partialUpdate(id, updateProductDto, file)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      const id = 1;
      const result: IRecourseDeleted<any> = { status: true, message: 'Product deleted', recourse: {} };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(id)).toEqual(result);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 1;

      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if deletion fails', async () => {
      const id = 1;

      jest.spyOn(service, 'remove').mockRejectedValue(new BadRequestException());

      await expect(controller.remove(id)).rejects.toThrow(BadRequestException);
    });
  });
});