import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IRecourseFound, IRecourseCreated, IRecourseDeleted } from '../global/responseInterfaces';
import { ProductImage } from './entities/image.entity';
import { MulterFile } from './dto/multer-file';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('ImagesController', () => {
  let controller: ImagesController;
  let service: ImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
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
          provide: ImagesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    service = module.get<ImagesService>(ImagesService);
  });

  it('test_find_all_images_success', async () => {
    const result: IRecourseFound<ProductImage[]> = {
      status: true,
      message: 'The product images were found successfully',
      recourse: [],
    };
    jest.spyOn(service, 'findAll').mockResolvedValue(result);

    expect(await controller.findAll()).toBe(result);
  });

  it('test_create_image_error', async () => {
    const id = 1;
    const file: MulterFile = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: 'uploads/',
      filename: 'test.jpg',
      path: 'uploads/test.jpg',
    };

    jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException());

    await expect(controller.create(id, file)).rejects.toThrow(BadRequestException);
  });

  it('test_find_one_image_not_found', async () => {
    const id = 1;
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
  });

  it('test_remove_image_success', async () => {
    const id = 1;
    const result: IRecourseDeleted<ProductImage> = {
      status: true,
      message: 'The product image was deleted successfully',
      recourse: new ProductImage(),
    };
    jest.spyOn(service, 'remove').mockResolvedValue(result);

    expect(await controller.remove(id)).toBe(result);
  });

  it('test_remove_image_not_found', async () => {
    const id = 1;
    jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

    await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
  });

  describe('create', () => {
    it('should successfully add a new image to a product and return a response with status CREATED', async () => {
      const mockFile: MulterFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'uploads/',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
      };

      const mockResponse: IRecourseCreated<ProductImage> = {
        status: true,
        message: 'The product image was created successfully',
        recourse: new ProductImage(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockResponse);

      const result = await controller.create(1, mockFile);
      expect(result).toEqual(mockResponse);
    });

    it('should throw a BadRequestException if there is an error during the creation of a new image', async () => {
      const mockFile: MulterFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'uploads/',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
      };

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('Error in the creation of the product image'));

      await expect(controller.create(1, mockFile)).rejects.toThrow(BadRequestException);
    });

    it('should handle file upload errors gracefully and throw a BadRequestException if the file cannot be saved', async () => {
      const mockFile: MulterFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'uploads/',
        filename: 'test.jpg',
        path: 'uploads/test.jpg',
      };

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException('Error deleting file in FTP server'));

      await expect(controller.create(1, mockFile)).rejects.toThrow(BadRequestException);
    });
  });
});