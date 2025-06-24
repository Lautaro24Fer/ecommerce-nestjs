import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { IRecourseCreated, IRecourseFound } from '../global/responseInterfaces';
import { Role } from './entities/role.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IRecourseUpdated, IRecourseDeleted } from '../global/responseInterfaces';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
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
          provide: RolesService,
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

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  describe('create', () => {
    it('should create a new role successfully', async () => {
      const createRoleDto: CreateRoleDto = { name: 'newRole' };
      const result: IRecourseCreated<Role> = {
        status: true,
        message: 'Role created successfully',
        recourse: { id: 1, name: 'newRole' },
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createRoleDto)).toEqual(result);
    });

    it('should throw BadRequestException if creation fails', async () => {
      const createRoleDto: CreateRoleDto = { name: 'newRole' };

      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException());

      await expect(controller.create(createRoleDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const result: IRecourseFound<Role[]> = {
        status: true,
        message: 'Roles found successfully',
        recourse: [{ id: 1, name: 'admin' }, { id: 2, name: 'user' }],
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });

    it('should throw BadRequestException if loading fails', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new BadRequestException());

      await expect(controller.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const result: IRecourseFound<Role> = {
        status: true,
        message: 'Role found successfully',
        recourse: { id: 1, name: 'admin' },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toEqual(result);
    });

    it('should throw NotFoundException if role is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if loading fails', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException());

      await expect(controller.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const updateRoleDto: UpdateRoleDto = { name: 'updatedRole' };
      const result: IRecourseUpdated<Role> = {
        status: true,
        message: 'Role updated successfully',
        recourse: { id: 1, name: 'updatedRole' },
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateRoleDto)).toEqual(result);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const updateRoleDto: UpdateRoleDto = { name: 'updatedRole' };

      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update(999, updateRoleDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if update fails', async () => {
      const updateRoleDto: UpdateRoleDto = { name: 'updatedRole' };

      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException());

      await expect(controller.update(1, updateRoleDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a role successfully', async () => {
      const result: IRecourseDeleted<Role> = {
        status: true,
        message: 'Role deleted successfully',
        recourse: { id: 1, name: 'moderator' },
      };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1)).toEqual(result);
    });

    it('should throw NotFoundException if role is not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if removal fails', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new BadRequestException());

      await expect(controller.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});