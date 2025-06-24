import { Test, TestingModule } from '@nestjs/testing';
import { BrandService } from './brand.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QueryParamsBrandDto } from './dto/query-params.dto';

describe('BrandService', () => {
  let service: BrandService;
  let repository: Repository<Brand>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: getRepositoryToken(Brand),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
    repository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
  });

  describe('create', () => {
    it('should create a brand successfully', async () => {
      const createBrandDto: CreateBrandDto = { name: 'Test Brand' };
      const brand: Brand = { id: 1, name: 'Test Brand' };

      jest.spyOn(repository, 'save').mockResolvedValue(brand);

      const result = await service.create(createBrandDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The brand was created succesfully');
      expect(result.recourse).toEqual(brand);
    });

    it('should throw BadRequestException on save error', async () => {
      const createBrandDto: CreateBrandDto = { name: 'Test Brand' };

      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Save error'));

      await expect(service.create(createBrandDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a brand if found', async () => {
      const id = 1;
      const brand: Brand = { id, name: 'Test Brand' };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(brand);

      const result = await service.findOne(id);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The brands was loaded succesfully');
      expect(result.recourse).toEqual(brand);
    });

    it('should throw NotFoundException if brand not found', async () => {
      const id = 1;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all brands', async () => {
      const brands: Brand[] = [{ id: 1, name: 'Brand 1' }, { id: 2, name: 'Brand 2' }];

      const queryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(brands),
      };

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(queryBuilder);

      const queryParams: QueryParamsBrandDto = { name: 'Brand', limit: 10 };

      const result = await service.findAll(queryParams);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The brands were loaded successfully');
      expect(result.recourse).toEqual(brands);
      expect(queryBuilder.andWhere).toHaveBeenCalled();
      expect(queryBuilder.take).toHaveBeenCalled();
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });


    it('should throw BadRequestException on find error', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Find error'));
      const queryParams: QueryParamsBrandDto = {} as unknown as QueryParamsBrandDto;

      await expect(service.findAll(queryParams)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a brand successfully', async () => {
      const id = 1;
      const updateBrandDto: UpdateBrandDto = { name: 'Updated Brand' };
      const existingBrand: Brand = { id, name: 'Old Brand' };
      const updatedBrand: Brand = { id, name: 'Updated Brand' };

      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: existingBrand });
      jest.spyOn(repository, 'save').mockResolvedValue(updatedBrand);

      const result = await service.update(id, updateBrandDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The brand was updated succesfully');
      expect(result.recourse).toEqual(updatedBrand);
    });

    it('should throw BadRequestException on save error', async () => {
      const id = 1;
      const updateBrandDto: UpdateBrandDto = { name: 'Updated Brand' };
      const existingBrand: Brand = { id, name: 'Old Brand' };

      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: existingBrand });
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Save error'));

      await expect(service.update(id, updateBrandDto)).rejects.toThrow(BadRequestException);
    });
    
  });

  describe('remove', () => {
    it('should remove a brand successfully', async () => {
      const id = 1;
      const brand: Brand = { id, name: 'Test Brand' };

      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: brand });
      jest.spyOn(repository, 'remove').mockResolvedValue(brand);

      const result = await service.remove(id);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The brand was removed succesfully');
      expect(result.recourse).toEqual(brand);
    });

    it('should throw BadRequestException on remove error', async () => {
      const id = 1;
      const brand: Brand = { id, name: 'Test Brand' };

      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: brand });
      jest.spyOn(repository, 'remove').mockRejectedValue(new Error('Remove error'));

      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
    });
  });
  
});