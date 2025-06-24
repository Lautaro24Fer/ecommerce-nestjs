import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/image.entity';
import { ProductService } from '../product/product.service';
import { FtpService } from '../ftp/ftp.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MulterFile } from './dto/multer-file';
import { Product } from '../product/entities/product.entity';
import { Brand } from '../brand/entities/brand.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { ProductType } from '../type/entities/type.entity';

describe('ImagesService', () => {
  let service: ImagesService;
  let imageRepository: Repository<ProductImage>;
  let productService: ProductService;
  let ftpService: FtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(ProductImage),
          useClass: Repository,
        },
        {
          provide: ProductService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(), 
          },
        },
        {
          provide: FtpService,
          useValue: {
            saveImageOnFTPServer: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    imageRepository = module.get<Repository<ProductImage>>(getRepositoryToken(ProductImage));
    productService = module.get<ProductService>(ProductService);
    ftpService = module.get<FtpService>(FtpService);
  });

  it('test_create_product_image_success', async () => {
    const mockProduct: Product = {
      id: 1,
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      secondariesImages: [],
      type: new ProductType,
      brand: new Brand,
      supplier: new Supplier,
      cost: 0
    } as unknown as Product;
    const mockFile: MulterFile = { path: 'path/to/file', filename: 'file.jpg' } as MulterFile;
    const mockImageUrl = 'ftp://server/path/to/file.jpg';
    const mockImage = { id: 1, url: mockImageUrl, product: mockProduct };

    jest.spyOn(productService, 'findOne').mockResolvedValue({
      status: true,
      message: "",
      recourse: mockProduct
    });
    jest.spyOn(ftpService, 'saveImageOnFTPServer').mockResolvedValue(mockImageUrl);
    jest.spyOn(imageRepository, 'create').mockReturnValue(mockImage);
    jest.spyOn(imageRepository, 'save').mockResolvedValue(mockImage);

    const result = await service.create(1, mockFile);

    expect(result.status).toBe(true);
    expect(result.message).toBe("The product image was created successfully");
    expect(result.recourse).toEqual(mockImage);
  });

  it('test_create_product_image_error_handling', async () => {
    const mockProduct: Product = {
      id: 1,
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      secondariesImages: [],
      type: new ProductType,
      brand: new Brand,
      supplier: new Supplier,
      cost: 0
    } as unknown as Product;
    const mockFile: MulterFile = { path: 'path/to/file', filename: 'file.jpg' } as MulterFile;
    const mockImageUrl = 'ftp://server/path/to/file.jpg';
    const mockImage = { id: 1, url: mockImageUrl, product: mockProduct };

    jest.spyOn(productService, 'findOne').mockResolvedValue({
      status: true,
      message: "",
      recourse: mockProduct
    });
    jest.spyOn(ftpService, 'saveImageOnFTPServer').mockResolvedValue(mockImageUrl);
    jest.spyOn(imageRepository, 'create').mockReturnValue(mockImage);
    jest.spyOn(imageRepository, 'save').mockRejectedValue(new Error('Database error'));
    jest.spyOn(ftpService, 'deleteFile').mockResolvedValue();

    await expect(service.create(1, mockFile)).rejects.toThrow(BadRequestException);
  });

  it('test_find_all_product_images_success', async () => {
    const mockImages = [{ id: 1, url: 'url1' }, { id: 2, url: 'url2' }];

    jest.spyOn(imageRepository, 'createQueryBuilder').mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockImages),
    } as any);

    const result = await service.findAll();

    expect(result.status).toBe(true);
    expect(result.message).toBe("The product images was found successfully");
    expect(result.recourse).toEqual(mockImages);
  });

  it('test_find_one_product_image_success', async () => {
    const mockImage: ProductImage = { id: 1, url: 'url1', product: {
      id: 1,
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      secondariesImages: [],
      type: new ProductType,
      brand: new Brand,
      supplier: new Supplier,
      cost: 0
    } as unknown as Product } ;

    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(mockImage);

    const result = await service.findOne(1);

    expect(result.status).toBe(true);
    expect(result.message).toBe("The product image was found successfully");
    expect(result.recourse).toEqual(mockImage);
  });

  it('test_find_one_product_image_not_found', async () => {
    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  // it('test_find_one_by_id_and_url_success', async () => {
  //   const mockProduct: Product = {
  //     id: 1,
  //     name: '',
  //     price: 0,
  //     stock: 0,
  //     description: '',
  //     image: '',
  //     secondariesImages: [],
  //     type: new ProductType,
  //     brand: new Brand,
  //     supplier: new Supplier
  //   };
  //   const mockImage: ProductImage = { id: 1, url: 'url1', product: mockProduct };

  //   jest.spyOn(imageRepository, 'findOne').mockResolvedValue(mockImage);

  //   const result = await service.findOneByIdAndUrl(1, 'url1');

  //   expect(result.status).toBe(true);
  //   expect(result.message).toBe("The product image was found successfully");
  //   expect(result.recourse).toEqual(mockImage);
  // });

  // it('test_find_one_by_id_and_url_not_found', async () => {
  //   jest.spyOn(imageRepository, 'findOne').mockResolvedValue(null);

  //   await expect(service.findOneByIdAndUrl(1, 'url1')).rejects.toThrow(NotFoundException);
  // });

  it('test_remove_by_url_success', async () => {
    const mockProduct: Product = {
      id: 1,
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      secondariesImages: [],
      type: new ProductType,
      brand: new Brand,
      supplier: new Supplier,
      cost: 0
    } as unknown as Product;
    const mockImage: ProductImage = { id: 1, url: '', product: mockProduct };

    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(mockImage);
    jest.spyOn(imageRepository, 'remove').mockResolvedValue(mockImage);
    jest.spyOn(ftpService, 'deleteFile').mockResolvedValue();

    const result = await service.removeByUrl(mockImage.url);

    expect(result.status).toBe(true);
    expect(result.message).toBe("The product image was deleted successfully");
    expect(result.recourse).toEqual(mockImage);
  });

  it('test_remove_by_url_not_found', async () => {
    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(null);

    await expect(service.removeByUrl('url1')).rejects.toThrow(NotFoundException);
  });

  it('test_remove_success', async () => {
    const mockProduct: Product = {
      id: 1,
      name: '',
      price: 0,
      stock: 0,
      description: '',
      image: '',
      secondariesImages: [],
      type: new ProductType,
      brand: new Brand,
      supplier: new Supplier,
      cost: 0
    } as unknown as Product;
    const mockImage: ProductImage = { id: 1, url: 'url1', product: mockProduct };

    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(mockImage);
    jest.spyOn(imageRepository, 'remove').mockResolvedValue(mockImage);
    jest.spyOn(ftpService, 'deleteFile').mockResolvedValue();

    const result = await service.remove(mockImage.id);

    expect(result.status).toBe(true);
    expect(result.message).toBe("The product image was deleted successfully");
    expect(result.recourse).toEqual(mockImage);
  });

  it('test_remove_not_found', async () => {
    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

});