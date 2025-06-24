import { Test, TestingModule } from '@nestjs/testing';
import { TypeService } from './type.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from './entities/type.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TypeService', () => {
  let service: TypeService;
  let repository: Repository<ProductType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeService,
        {
          provide: getRepositoryToken(ProductType),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TypeService>(TypeService);
    repository = module.get<Repository<ProductType>>(getRepositoryToken(ProductType));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product type', async () => {
      const createTypeDto = { name: 'NewType' };
      jest.spyOn(repository, 'existsBy').mockResolvedValue(false);
      jest.spyOn(repository, 'save').mockResolvedValue(createTypeDto as ProductType);

      const result = await service.create(createTypeDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The product type was created succesfully');
      expect(result.recourse).toEqual(createTypeDto);
    });

    it('should throw BadRequestException if name exists', async () => {
      const createTypeDto = { name: 'ExistingType' };
      jest.spyOn(repository, 'existsBy').mockResolvedValue(true);

      await expect(service.create(createTypeDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all product types', async () => {
      const productTypes = [{ id: 1, name: 'Type1' }, { id: 2, name: 'Type2' }];
      jest.spyOn(repository, 'find').mockResolvedValue(productTypes as ProductType[]);

      const result = await service.findAll();

      expect(result.status).toBe(true);
      expect(result.message).toBe('The product types was loaded succesfully');
      expect(result.recourse).toEqual(productTypes);
    });
  });

  describe('findOne', () => {
    it('should return a product type by id', async () => {
      const productType = { id: 1, name: 'Type1' };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(productType as ProductType);

      const result = await service.findOne(1);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The product type was found succesfully');
      expect(result.recourse).toEqual(productType);
    });

    it('should throw NotFoundException if product type not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
  describe('update', () => {
    it('should update a product type', async () => {
      const id = 1;
      const updateTypeDto = { name: 'UpdatedType' };
      const existingProductType = { id, name: 'OldType' };
      const updatedProductType = { ...existingProductType, ...updateTypeDto };

      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: existingProductType });
      jest.spyOn(repository, 'save').mockResolvedValue(updatedProductType as ProductType);

      const result = await service.update(id, updateTypeDto);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The product type was updated succesfully');
      expect(result.recourse).toEqual(updatedProductType);
    });

    it('should throw NotFoundException if product type not found', async () => {
      const id = 1;
      const updateTypeDto = { name: 'UpdatedType' };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.update(id, updateTypeDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product type', async () => {
      const id = 1;
      const productType = { id, name: 'TypeToRemove' };

      jest.spyOn(service, 'findOne').mockResolvedValue({ status: true, message: '', recourse: productType });
      jest.spyOn(repository, 'remove').mockResolvedValue(productType as ProductType);

      const result = await service.remove(id);

      expect(result.status).toBe(true);
      expect(result.message).toBe('The product type was deleted succesfully');
      expect(result.recourse).toEqual(productType);
    });

    it('should throw NotFoundException if product type not found', async () => {
      const id = 1;

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});