import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IRecourseFound } from '../global/responseInterfaces';

describe('RolesService', () => {
  let service: RolesService;
  let repository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const createRoleDto = { name: 'newRole' };
      const savedRole = { id: 1, ...createRoleDto };
      jest.spyOn(repository, 'save').mockResolvedValue(savedRole);

      const result = await service.create(createRoleDto);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(savedRole);
    });

    it('should throw BadRequestException on save error', async () => {
      const createRoleDto = { name: 'newRole' };
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(createRoleDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [{ id: 1, name: 'role1' }, { id: 2, name: 'role2' }];
      jest.spyOn(repository, 'find').mockResolvedValue(roles);

      const result = await service.findAll();
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(roles);
    });

    it('should throw BadRequestException on find error', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const role = { id: 1, name: 'role1' };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(role);

      const result = await service.findOne(1);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on find error', async () => {
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error());

      await expect(service.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOneByName', () => {
    it('should return a role by name', async () => {
      const role = { id: 1, name: 'role1' };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(role);

      const result = await service.findOneByName('role1');
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(role);
    });

    it('should throw NotFoundException if role not found by name', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOneByName('role1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on find error by name', async () => {
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(new Error());

      await expect(service.findOneByName('role1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const id = 1;
      const role: Role = { id: 1, name: 'role1' };
      const updateRoleDto: UpdateRoleDto = { name: 'updatedRole' };
      const updatedRole: Role = { id: 1, name: 'updatedRole' };

      const serviceResult: IRecourseFound<Role> = {
        status: true,
        message: '',
        recourse: role
      };

      const controllerResult: IRecourseFound<Role> = {
        status: true,
        message: 'Role updated succesfully',
        recourse: updatedRole
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(serviceResult);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedRole);

      
      expect(await service.update(id, updateRoleDto)).toEqual(controllerResult);
    });

    it('should throw BadRequestException on update error', async () => {
      const role = { id: 1, name: 'role1' };
      const updateRoleDto = { name: 'updatedRole' };

      const serviceResult: IRecourseFound<Role> = {
        status: true,
        message: '',
        recourse: role
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(serviceResult);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.update(1, updateRoleDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {

    const role = { id: 1, name: 'moderator' };
    const findOneResponse: IRecourseFound<Role> = {
      status: true,
      message: '',
      recourse: role
    };

    it('should remove a role successfully', async () => {

      jest.spyOn(service, 'findOne').mockResolvedValue(findOneResponse);
      jest.spyOn(repository, 'remove').mockResolvedValue(role);

      const result = await service.remove(1);
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(role);
    });

    it('should throw BadRequestException if trying to remove user or admin role', async () => {
      const adminRole = { id: 1, name: 'admin' };
      const findOneAdminResponse: IRecourseFound<Role> = {
        status: true,
        message: '',
        recourse: adminRole
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(findOneAdminResponse);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on remove error', async () => {
      // const role = { id: 1, name: 'moderator' };

      jest.spyOn(service, 'findOne').mockResolvedValue(findOneResponse);
      jest.spyOn(repository, 'remove').mockRejectedValue(new Error());

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });
});