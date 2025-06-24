import { Test, TestingModule } from '@nestjs/testing';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated } from '../global/responseInterfaces';
import { Brand } from './entities/brand.entity';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryParamsBrandDto } from './dto/query-params.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('BrandController', () => {
  let brandController: BrandController;
  let brandService: BrandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
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
          provide: BrandService,
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

    brandController = module.get<BrandController>(BrandController);
    brandService = module.get<BrandService>(BrandService);
  });

  describe('create', () => {
    it('should create a new brand successfully', async () => {
      const createBrandDto: CreateBrandDto = { name: 'New Brand' };
      const createdBrand: IRecourseCreated<Brand> = {
        status: true,
        message: 'The brand was created succesfully',
        recourse: { id: 1, name: 'New Brand' },
      };

      jest.spyOn(brandService, 'create').mockResolvedValue(createdBrand);

      expect(await brandController.create(createBrandDto)).toEqual(createdBrand);
    });

    it('should throw BadRequestException on creation error', async () => {
      const createBrandDto: CreateBrandDto = { name: 'Invalid Brand' };

      jest.spyOn(brandService, 'create').mockRejectedValue(new BadRequestException());

      await expect(brandController.create(createBrandDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all brands successfully', async () => {
      const brands: Brand[] = [{ id: 1, name: 'Brand A' }, { id: 2, name: 'Brand B' }];
      const foundBrands: IRecourseFound<Brand[]> = {
        status: true,
        message: 'The brands was loaded succesfully',
        recourse: brands,
      };

      jest.spyOn(brandService, 'findAll').mockResolvedValue(foundBrands);

      const queryParams: QueryParamsBrandDto = {} as unknown as QueryParamsBrandDto;

      expect(await brandController.findAll(queryParams)).toEqual(foundBrands);
    });

    it('should throw BadRequestException on find error', async () => {
      jest.spyOn(brandService, 'findAll').mockRejectedValue(new BadRequestException());

      const queryParams: QueryParamsBrandDto = {} as unknown as QueryParamsBrandDto;


      await expect(brandController.findAll(queryParams)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a brand by id successfully', async () => {
      const brand: Brand = { id: 1, name: 'Brand A' };
      const foundBrand: IRecourseFound<Brand> = {
        status: true,
        message: 'The brands was loaded succesfully',
        recourse: brand,
      };

      jest.spyOn(brandService, 'findOne').mockResolvedValue(foundBrand);

      expect(await brandController.findOne(1)).toEqual(foundBrand);
    });

    it('should throw NotFoundException if brand is not found', async () => {
      jest.spyOn(brandService, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(brandController.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a brand successfully', async () => {
      const brandId = 1;
      const updateBrandDto: UpdateBrandDto = { name: 'Updated Brand' };
      const updatedBrand: IRecourseUpdated<Brand> = {
        status: true,
        message: 'The brand was updated succesfully',
        recourse: { id: brandId, name: 'Updated Brand' },
      };

      jest.spyOn(brandService, 'update').mockResolvedValue(updatedBrand);

      expect(await brandController.update(brandId, updateBrandDto)).toEqual(updatedBrand);
    });

    it('should throw BadRequestException on update error', async () => {
      const brandId = 1;
      const updateBrandDto: UpdateBrandDto = { name: '' }; // Invalid data

      jest.spyOn(brandService, 'update').mockRejectedValue(new BadRequestException());

      await expect(brandController.update(brandId, updateBrandDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if brand to update is not found', async () => {
      const brandId = 999;
      const updateBrandDto: UpdateBrandDto = { name: 'Non-existent Brand' };

      jest.spyOn(brandService, 'update').mockRejectedValue(new NotFoundException());

      await expect(brandController.update(brandId, updateBrandDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a brand successfully', async () => {
      const brandId = 1;
      const deletedBrand: IRecourseDeleted<Brand> = {
        status: true,
        message: 'The brand was deleted succesfully',
        recourse: new Brand
      };

      jest.spyOn(brandService, 'remove').mockResolvedValue(deletedBrand);

      expect(await brandController.remove(brandId)).toEqual(deletedBrand);
    });

    it('should throw NotFoundException if brand to remove is not found', async () => {
      const brandId = 999;

      jest.spyOn(brandService, 'remove').mockRejectedValue(new NotFoundException());

      await expect(brandController.remove(brandId)).rejects.toThrow(NotFoundException);
    });
  });
});