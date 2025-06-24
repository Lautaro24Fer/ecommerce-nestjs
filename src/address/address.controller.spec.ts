import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IRecourseCreated, IRecourseFound, IRecourseUpdated, IRecourseDeleted } from '../global/responseInterfaces';
import { Address } from './entities/address.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ConfigService } from '@nestjs/config';

describe('AddressController', () => {
  let addressController: AddressController;
  let addressService: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        {
          provide: AddressService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findOneByAllData: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true), // Mock AuthGuard
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockJwtToken'), // Mock JwtService
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mockJwtSecret'), // Mock ConfigService
          },
        },
      ],
    }).compile();

    addressController = module.get<AddressController>(AddressController);
    addressService = module.get<AddressService>(AddressService);
  });

  it('test_create_address_success', async () => {
    const createAddressDto: CreateAddressDto = {
      postalCode: '12345',
      addressStreet: 'Main St',
      addressNumber: '10',
    };

    const createdAddress: IRecourseCreated<Address> = {
      status: true,
      message: 'The address was created successfully',
      recourse: new Address(),
    };

    jest.spyOn(addressService, 'findOneByAllData').mockRejectedValue(new NotFoundException());
    jest.spyOn(addressService, 'create').mockResolvedValue(createdAddress);

    const result = await addressController.create(createAddressDto);
    expect(result).toEqual(createdAddress);
  });

  it('test_find_one_address_not_found', async () => {
    const id = 1;
    jest.spyOn(addressService, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(addressController.findOne(id)).rejects.toThrow(NotFoundException);
  });

  it('test_update_address_invalid_data', async () => {
    const id = 1;
    const updateAddressDto: UpdateAddressDto = {
      postalCode: '',
      addressStreet: 'Main St',
      addressNumber: '10',
    };

    jest.spyOn(addressService, 'update').mockRejectedValue(new BadRequestException());

    await expect(addressController.update(id, updateAddressDto)).rejects.toThrow(BadRequestException);
  });
});