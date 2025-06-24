import { Test, TestingModule } from '@nestjs/testing';
import { IdTypeController } from './id-type.controller';
import { IdTypeService } from './id-type.service';
import { CreateIdTypeDto } from './dto/create-id-type.dto';
import { UpdateIdTypeDto } from './dto/update-id-type.dto';
import { IRecourseCreated, IRecourseFound, IRecourseUpdated, IRecourseDeleted } from '../global/responseInterfaces';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IdType } from './entities/id-type.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('IdTypeController', () => {
  let controller: IdTypeController;
  let service: IdTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdTypeController],
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
          provide: IdTypeService,
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

    controller = module.get<IdTypeController>(IdTypeController);
    service = module.get<IdTypeService>(IdTypeService);
  });

  describe('create', () => {
    it('should successfully create a new identification type', async () => {
      const dto: CreateIdTypeDto = { name: 'DNI' };
      const result: IRecourseCreated<any> = {
        status: true,
        message: 'The identification type was created successfully',
        recourse: { id: 1, name: 'DNI' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
    });

    it('should throw BadRequestException if creation fails', async () => {
      const dto: CreateIdTypeDto = { name: 'DNI' };

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException());

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all identification types', async () => {
      const result: IRecourseFound<any[]> = {
        status: true,
        message: 'All identification types loaded',
        recourse: [{ id: 1, name: 'DNI' }],
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });

    it('should throw BadRequestException if finding fails', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new BadRequestException());

      await expect(controller.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return an identification type by id', async () => {
      const result: IRecourseFound<any> = {
        status: true,
        message: 'Identification type found',
        recourse: { id: 1, name: 'DNI' },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });

    it('should throw NotFoundException if identification type is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if finding fails', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException());

      await expect(controller.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });
  describe('update', () => {
    it('test_update_id_type_success', async () => {
      const updateIdTypeDto: IdType = {
        name: 'CPF',
        id: 1
      };
      const result: IRecourseUpdated<IdType> = {
        status: true,
        message: 'The identification type was updated successfully',
        recourse: updateIdTypeDto,
      };
  
      jest.spyOn(service, 'update').mockResolvedValue(result);
  
      expect(await controller.update(1, updateIdTypeDto)).toEqual(result);
    });
    it('should return NotFoundException if the identification type does not exist', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(1, new UpdateIdTypeDto())).rejects.toThrow(NotFoundException);
    });

    it('should return BadRequestException if there is an error during the update process', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException());

      await expect(controller.update(1, new UpdateIdTypeDto())).rejects.toThrow(BadRequestException);
    });
  }); 

  describe('remove', () => {
    it('should return NotFoundException if the identification type does not exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
    it('test_remove_id_type_success', async () => {
      const result: IRecourseDeleted<IdType> = {
        status: true,
        message: 'The identification type was deleted successfully',
        recourse: { id: 1, name: 'DNI' },
      };
  
      jest.spyOn(service, 'remove').mockResolvedValue(result);
  
      expect(await controller.remove(1)).toEqual(result);
    });
  });
});