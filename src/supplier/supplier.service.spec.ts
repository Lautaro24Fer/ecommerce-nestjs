import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from './supplier.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

describe('SupplierService', () => {
  let service: SupplierService;
  let repository: Repository<Supplier>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: getRepositoryToken(Supplier),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    repository = module.get<Repository<Supplier>>(getRepositoryToken(Supplier));
  });

  describe('create', () => {
    it('should create a supplier successfully', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: ''
      };
      const supplier: Supplier = { id: 1, ...createSupplierDto };

      jest.spyOn(repository, 'save').mockResolvedValue(supplier);

      const result = await service.create(createSupplierDto);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(supplier);
    });

    it('should throw BadRequestException on error', async () => {

      const createSupplierDto: CreateSupplierDto = {
        name: ''
      };

      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createSupplierDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of suppliers', async () => {
      const suppliers: Supplier[] = [{ id: 1 }, { id: 2 }] as unknown as Supplier[];

      jest.spyOn(repository, 'find').mockResolvedValue(suppliers);

      const result = await service.findAll();
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(suppliers);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const supplier: Supplier = { id: 1 } as unknown as Supplier;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(supplier);

      const result = await service.findOne(1);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(supplier);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error());

      await expect(service.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a supplier successfully', async () => {
      const id = 1;
      const updateSupplierDto: UpdateSupplierDto = {
        name: ''
      };
      const supplier = { id, ...updateSupplierDto };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(supplier);
      jest.spyOn(repository, 'save').mockResolvedValue(supplier);

      const result = await service.update(id, updateSupplierDto);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(supplier);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      const id = 1;
      const updateSupplierDto: UpdateSupplierDto = {
        name: ''
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(id, updateSupplierDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      const id = 1;
      const supplier: Supplier = {} as unknown as Supplier;
      const updateSupplierDto: UpdateSupplierDto = {
        name: ''
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(supplier);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.update(id, updateSupplierDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a supplier successfully', async () => {
      const id = 1;
      const supplier = { id } as unknown as Supplier;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(supplier);
      jest.spyOn(repository, 'remove').mockResolvedValue(supplier);

      const result = await service.remove(id);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(supplier);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      const id = 1;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      const id = 1;
      const supplier = { id } as unknown as Supplier;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(supplier);
      jest.spyOn(repository, 'remove').mockRejectedValue(new Error());

      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
    });
  });
});