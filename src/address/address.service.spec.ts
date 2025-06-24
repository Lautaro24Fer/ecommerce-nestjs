import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { BadRequestException  } from '@nestjs/common';
import { UserService } from '../user/user.service';

describe('AddressService', () => {
  let service: AddressService;
  let addressRepository: Repository<Address>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(Address),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    addressRepository = module.get<Repository<Address>>(getRepositoryToken(Address));
    userService = module.get<UserService>(UserService);
  });

  it('test_remove_orphaned_addresses_success', async () => {
    const orphanedAddresses = [{ id: 1 }, { id: 2 }];
    jest.spyOn(addressRepository, 'createQueryBuilder').mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(orphanedAddresses),
    } as any);
    jest.spyOn(addressRepository, 'remove').mockResolvedValue(orphanedAddresses as any);

    await service.removeOrphanedAddresses();

    expect(addressRepository.remove).toHaveBeenCalledWith(orphanedAddresses);
  });

  describe('create', () => {
    it('should create a new address successfully', async () => {
      const createAddressDto: CreateAddressDto = {
        postalCode: '12345',
        addressStreet: 'Main St',
        addressNumber: '10',
        userId: 1,
      };

      const address: Address = {
        id: 1,
        postalCode: '12345',
        addressStreet: 'main st',
        addressNumber: '10',
        user: [],
      };

      jest.spyOn(addressRepository, 'create').mockReturnValue(address);
      jest.spyOn(addressRepository, 'save').mockResolvedValue(address);
      jest.spyOn(userService, 'update').mockResolvedValue(undefined);

      const result = await service.create(createAddressDto);

      expect(result).toEqual({
        status: true,
        message: 'The address was created succesfully',
        recourse: address,
      });
      expect(userService.update).toHaveBeenCalledWith(1, { address: [address] }, expect.anything());
    });

    it('should throw BadRequestException when address creation fails', async () => {
      const createAddressDto: CreateAddressDto = {
        postalCode: '12345',
        addressStreet: 'Main St',
        addressNumber: '10',
      };

      jest.spyOn(addressRepository, 'create').mockImplementation(() => {
        throw new Error('Error creating the new instance of address');
      });

      await expect(service.create(createAddressDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when saving address fails', async () => {
      const createAddressDto: CreateAddressDto = {
        postalCode: '12345',
        addressStreet: 'Main St',
        addressNumber: '10',
      };

      const address: Address = {
        id: 1,
        postalCode: '12345',
        addressStreet: 'main st',
        addressNumber: '10',
        user: [],
      };

      jest.spyOn(addressRepository, 'create').mockReturnValue(address);
      jest.spyOn(addressRepository, 'save').mockRejectedValue(new Error('Error creating the new address'));

      await expect(service.create(createAddressDto)).rejects.toThrow(BadRequestException);
    });
  });
});