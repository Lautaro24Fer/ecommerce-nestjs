import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { BrandService } from '../brand/brand.service';
import { SupplierService } from '../supplier/supplier.service';
import { TypeService } from '../type/type.service';
import { FtpService } from '../ftp/ftp.service';
import { ImagesService } from '../images/images.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IRecourseFound } from '../global/responseInterfaces';
import { ItemDto } from '../payment/dto/preference-payment';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let ftpService: FtpService;
  let imagesService: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
        {
          provide: BrandService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: SupplierService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: TypeService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: FtpService,
          useValue: { saveImageOnFTPServer: jest.fn(), deleteFile: jest.fn() },
        },
        {
          provide: ImagesService,
          useValue: { create: jest.fn(), remove: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    ftpService = module.get<FtpService>(FtpService);
    imagesService = module.get<ImagesService>(ImagesService);
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      // Mock dependencies
      jest.spyOn(productRepository, 'create').mockReturnValue({} as Product);
      jest.spyOn(productRepository, 'save').mockResolvedValue({ id: 1 } as Product);
      jest.spyOn(service, 'findOne').mockResolvedValue({ recourse: {} as Product } as any);

      const result = await service.create({ brandId: 1, supplierId: 1, typeId: 1, cost: 50, price: 100 } as any, {} as any);
      expect(result.status).toBe(true);
      expect(result.message).toBe("The product was created succesfully");
    });

    it('should throw BadRequestException if cost is greater than or equal to price', async () => {
      await expect(service.create({ cost: 100, price: 100 } as any, {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.findAll({});
      expect(result.status).toBe(true);
      expect(result.message).toBe("The products was found succesfully");
    });

    it('should handle errors when retrieving products', async () => {
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Error')),
      } as any);

      await expect(service.findAll({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      
      const productMocked: Product = {
        id: 1,
        isActive: true,
        
      } as unknown as Product;
  
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(productMocked);
  
      const result = await service.findOne(1);
      expect(result.status).toBe(true);
      expect(result.message).toBe("The product was found successfully");
      expect(result.recourse).toEqual(productMocked);
    });
  

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
  describe('update', () => {
    it('should update a product successfully', async () => {
      const product = { id: 1, image: 'old-image-url' } as Product;
      jest.spyOn(service, 'findOne').mockResolvedValue({ recourse: product } as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue({ ...product, name: 'Updated Name' } as Product);

      const result = await service.update(1, { name: 'Updated Name' } as any);
      expect(result.status).toBe(true);
      expect(result.message).toBe("The product was updated succesfully");
    });

    it('should throw BadRequestException if update fails', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ recourse: {} as Product } as any);
      jest.spyOn(productRepository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.update(1, {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should set isActive to false and return the updated product', async () => {
      const productId = 1;
      const product = {
        id: productId,
        isActive: true,
        image: 'ftp://padel-point/image.jpg',
        secondariesImages: [{ id: 1 }, { id: 2 }],
      } as unknown as Product;

      const findOneResponseMock: IRecourseFound<Product> = {
        recourse: product
      } as unknown as IRecourseFound<Product>
      
      jest.spyOn(service, 'findOne').mockResolvedValue(findOneResponseMock);
      jest.spyOn(productRepository, 'save').mockResolvedValue({ ...product, isActive: false });

      const result = await service.remove(productId);

      expect(result.recourse.isActive).toBe(false);
      expect(ftpService.deleteFile).toHaveBeenCalledWith(product.image);
      expect(imagesService.remove).toHaveBeenCalledTimes(product.secondariesImages.length);
      expect(productRepository.save).toHaveBeenCalledWith({ ...product, isActive: false });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      const productId = 1;
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(productId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if there is an error during save', async () => {
      const productId = 1;
      const product = {
        id: productId,
        isActive: true,
        image: 'ftp://padel-point/image.jpg',
        secondariesImages: [{ id: 1 }, { id: 2 }],
      } as Product;

      const findOneResponseMock: IRecourseFound<Product> = {
        recourse: product
      } as unknown as IRecourseFound<Product>

      jest.spyOn(service, 'findOne').mockResolvedValue(findOneResponseMock);
      jest.spyOn(productRepository, 'save').mockRejectedValue(new Error('Save error'));

      await expect(service.remove(productId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateOperation', () => {

    const product = { id: 1, stock: 10 } as unknown as Product;
    const findOneResult: IRecourseFound<Product> = {
      status: true,
      message: '',
      recourse: product
    }
    const itemDto: ItemDto = {
      id: 0,
      title: '',
      currency_id: '',
      description: '',
      category_id: '',
      quantity: 0,
      unit_price: 0
    }

    it('should validate operation successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(findOneResult);

      const result = await service.validateOperation([itemDto]);
      expect(result.status).toBe(true);
      expect(result.message).toBe("The operation vas validated succesfully. Valid order");
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(findOneResult);

      const itemDtoFail: ItemDto = {
        id: 1,
        quantity: 999,
      } as unknown as ItemDto;

      await expect(service.validateOperation([itemDtoFail])).rejects.toThrow(BadRequestException);
    });
  });
});