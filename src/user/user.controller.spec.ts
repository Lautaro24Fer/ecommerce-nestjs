import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { IRecourseCreated, IRecourseFound, IRecourseUpdated, IRecourseDeleted } from '../global/responseInterfaces';
import { Address } from '../address/entities/address.entity';
import { HttpStatus, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthUserResponseDto } from './dto/oauth-data';
import { RequestUpdatePasswordCodeDto, ValidateUpdateUserPasswordCodeDto, UpdateUserPasswordDto } from './dto/password-change';
import { PartialUpdateUserDto, FullUpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IdType } from '../id-type/entities/id-type.entity';
import { Request } from 'express';
import { LoginMethodType } from '../global/enum';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            resetPasswordRequest: jest.fn(),
            validatePasswordResetCode: jest.fn(),
            resetPassword: jest.fn(),
            responseByAuthStrategy: jest.fn(),
            mapUserToUserDto: jest.fn()
          },
        },
        {
          provide: JwtService, // Provide a mock JwtService
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt'),
            decode: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
        {
          provide: ConfigService, // Proveer un mock de ConfigService
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'), // Mockea los métodos que necesites
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        password: 'securePassword123',
        phone: '+541234567890',
        email: 'john.doe@example.com',
        idType: 1,
        idNumber: 12345678,
        address: []
      };
  
      const userEntity = new User();
      userEntity.id = 1;
      userEntity.name = 'John';
      userEntity.surname = 'Doe';
      userEntity.username = 'johndoe';
      userEntity.email = 'john.doe@example.com';
      userEntity.phone = '+541234567890';
      userEntity.idType = { id: 1 } as unknown as IdType;
      userEntity.idNumber = '12345678';
      userEntity.address = [];
      userEntity.roles = [];
  
      const result: IRecourseCreated<User> = {
        status: true,
        message: 'The user was created successfully',
        recourse: userEntity
      };
  
      jest.spyOn(service, 'create').mockResolvedValue(result);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue({
        id: userEntity.id,
        name: userEntity.name,
        surname: userEntity.surname,
        username: userEntity.username,
        email: userEntity.email,
        phone: userEntity.phone,
        idType: userEntity.idType,
        idNumber: userEntity.idNumber,
        address: userEntity.address,
        roles: userEntity.roles,
        method: userEntity.method
      });
  
      const expectedResponse: IRecourseCreated<UserDto> = {
        status: true,
        message: 'The user was created successfully',
        recourse: {
          id: userEntity.id,
          name: userEntity.name,
          surname: userEntity.surname,
          username: userEntity.username,
          email: userEntity.email,
          phone: userEntity.phone,
          idType: userEntity.idType,
          idNumber: userEntity.idNumber,
          address: userEntity.address,
          roles: userEntity.roles,
          method: userEntity.method
        }
      };
  
      expect(await controller.create(createUserDto)).toEqual(expectedResponse);
    });
  
    it('should throw BadRequestException if user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        password: 'securePassword123',
        phone: '+541234567890',
        email: 'john.doe@example.com',
        idType: 1,
        idNumber: 12345678,
        address: []
      };
  
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException());
  
      await expect(controller.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result: IRecourseFound<User[]> = {
        status: false,
        message: '',
        recourse: []
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOneAuthenticated', () => {
    it('should return the authenticated user', async () => {
      const req = { cookies: { user: 'test-cookie' } } as any;
      const result: AuthUserResponseDto = {
        user: undefined,
        isNewUser: false
      };
      jest.spyOn(service, 'responseByAuthStrategy').mockResolvedValue(result);

      expect(await controller.findOneAuthenticated(req)).toEqual(result);
    });

    it('should throw BadRequestException if authentication fails', async () => {
      const req = { cookies: { user: 'test-cookie' } } as any;
      jest.spyOn(service, 'responseByAuthStrategy').mockRejectedValue(new BadRequestException());

      await expect(controller.findOneAuthenticated(req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getResetPasswordCode', () => {
    it('should send a reset password code', async () => {
      const dto: RequestUpdatePasswordCodeDto = {
        usernameOrEmail: 'test@example.com'
      };
  
      const userEntity = new User();
      userEntity.id = 1;
      userEntity.name = 'Test';
      userEntity.surname = 'User';
      userEntity.username = 'testuser';
      userEntity.email = 'test@example.com';
      userEntity.phone = '+541234567890';
      userEntity.idType = { id: 1 } as unknown as IdType;
      userEntity.idNumber = '12345678';
      userEntity.address = [];
      userEntity.roles = [];

      const resultService: IRecourseCreated<User> = {
        status: true,
        message: '',
        recourse: userEntity
      };

      const userDto: UserDto = {
        id: userEntity.id,
        name: userEntity.name,
        surname: userEntity.surname,
        username: userEntity.username,
        email: userEntity.email,
        phone: userEntity.phone,
        idType: userEntity.idType,
        idNumber: userEntity.idNumber,
        address: userEntity.address,
        roles: userEntity.roles,
        method: userEntity.method
      };

      const resultController: IRecourseFound<UserDto> = {
        status: true,
        message: '',
        recourse: userDto
      }
      jest.spyOn(service, 'resetPasswordRequest').mockResolvedValue(resultService);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue(userDto);
      
      expect(await controller.getResetPasswordCode(dto)).toEqual(resultController);
    });
  });

  describe('validateResetPasswordCode', () => {
    it('should validate the reset password code', async () => {
      const dto: ValidateUpdateUserPasswordCodeDto = {
        email: '',
        code: 0
      };
      const res = { cookie: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const jwt = 'test-jwt';
      jest.spyOn(service, 'validatePasswordResetCode').mockResolvedValue(jwt);

      await controller.validateResetPasswordCode(dto, res);
      expect(res.cookie).toHaveBeenCalledWith('password-reset', jwt, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('resetPassword', () => {
    it('should reset the password', async () => {
      const req = { cookies: { 'password-reset': 'test-jwt' } } as unknown as Request;
      const res = { 
        cookie: jest.fn(), 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn() 
      } as any;
  
      const userEntity: User = {
        id: 1,
        name: 'Test',
        surname: 'User',
        username: 'testuser',
        email: 'test@example.com',
        phone: '+541234567890',
        idType: { id: 1 } as unknown as IdType,
        idNumber: '12345678',
        address: [],
        roles: [],
        isActive: true,
        method: LoginMethodType.LOCAL,
      };
  
      const dto: UpdateUserPasswordDto = {
        newPassword: 'newPassword'
      };
  
      const userEntityUpdated: User = {
        ...userEntity,
        password: 'newPassword'
      };
  
      const result: IRecourseUpdated<User> = {
        status: true,
        message: 'The password was updated successfully',
        recourse: userEntityUpdated
      };
  
      const userDto: UserDto = {
        id: userEntityUpdated.id,
        name: userEntityUpdated.name,
        surname: userEntityUpdated.surname,
        username: userEntityUpdated.username,
        email: userEntityUpdated.email,
        phone: userEntityUpdated.phone,
        idType: userEntityUpdated.idType,
        idNumber: userEntityUpdated.idNumber,
        address: userEntityUpdated.address,
        roles: userEntityUpdated.roles,
        method: userEntityUpdated.method
      };
  
      jest.spyOn(service, 'resetPassword').mockResolvedValue(result);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue(userDto);
  
      const expectedResponse: IRecourseUpdated<UserDto> = {
        status: true,
        message: 'The password was updated successfully',
        recourse: userDto
      };
  
      await controller.resetPassword(req, res, dto);
      expect(res.cookie).toHaveBeenCalledWith('password-reset', '', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe('getUserAddresses', () => {
    it('should return user addresses', async () => {
      const id = 1;
      const user: User = {
        id: 0,
        name: '',
        surname: '',
        username: '',
        isActive: true,
        phone: '',
        idType: new IdType,
        idNumber: '',
        email: '',
        method: LoginMethodType.LOCAL,
        address: [],
        roles: []
      };

      const resultService: IRecourseFound<User> = {
        status: true,
        message: '',
        recourse: user
      };

      const addresses: Address[] = [] as Address[];
      const result: IRecourseFound<Address[]> = {
        status: true,
        message: 'All addresses was found succesfully',
        recourse: addresses
      };
      jest.spyOn(service, 'findOneById').mockResolvedValue(resultService);

      expect(await controller.getUserAddresses(id)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const id = 1;

      const user: User = {
        id: 0,
        name: '',
        surname: '',
        username: '',
        isActive: true,
        phone: '',
        idType: new IdType,
        idNumber: '',
        email: '',
        method: LoginMethodType.LOCAL,
        address: [],
        roles: []
      }

      const resultService: IRecourseFound<User> = {
        status: true,
        message: '',
        recourse: user
      }

      const userDto: UserDto = {
        ...user
      };

      const result: IRecourseFound<UserDto> = {
        status: true,
        message: '',
        recourse: userDto
      };
      jest.spyOn(service, 'findOneById').mockResolvedValue(resultService);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue(userDto);

      expect(await controller.findOne(id)).toEqual(result);
    });
  });

  describe('patchUpdate', () => {
    it('should update a user partially', async () => {
      const id = 1;
      const dto: PartialUpdateUserDto = {
        name: 'UpdatedName',
        surname: 'UpdatedSurname',
        username: 'updatedusername',
        phone: '+541234567890',
        email: 'updated.email@example.com',
        idType: 1,
        idNumber: 12345678,
        address: []
      };
  
      const userEntity: User = {
        id: 1,
        name: 'UpdatedName',
        surname: 'UpdatedSurname',
        username: 'updatedusername',
        phone: '+541234567890',
        email: 'updated.email@example.com',
        idType: { id: 1 } as unknown as IdType,
        idNumber: '12345678',
        address: [],
        roles: [],
        isActive: true,
        method: LoginMethodType.LOCAL,
      };
  
      const resultService: IRecourseUpdated<User> = {
        status: true,
        message: 'The user was updated successfully',
        recourse: userEntity
      };
  
      const userDto: UserDto = {
        id: userEntity.id,
        name: userEntity.name,
        surname: userEntity.surname,
        username: userEntity.username,
        email: userEntity.email,
        phone: userEntity.phone,
        idType: userEntity.idType,
        idNumber: userEntity.idNumber,
        address: userEntity.address,
        roles: userEntity.roles,
        method: userEntity.method
      };
  
      const expectedResponse: IRecourseUpdated<UserDto> = {
        status: true,
        message: 'The user was updated successfully',
        recourse: userDto
      };
  
      jest.spyOn(service, 'update').mockResolvedValue(resultService);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue(userDto);
  
      expect(await controller.patchUpdate(id, dto)).toEqual(expectedResponse);
    });
  });

  describe('putUpdate', () => {
    it('should update a user fully', async () => {
      const id = 1;
      const dto: FullUpdateUserDto = {
        name: 'UpdatedName',
        surname: 'UpdatedSurname',
        username: 'updatedusername',
        phone: '+541234567890',
        password: 'newSecurePassword123',
        email: 'updated.email@example.com',
        idType: 1,
        idNumber: 12345678,
        address: []
      };
  
      const userEntity: User = {
        id: 1,
        name: 'UpdatedName',
        surname: 'UpdatedSurname',
        username: 'updatedusername',
        phone: '+541234567890',
        email: 'updated.email@example.com',
        idType: { id: 1 } as unknown as IdType,
        idNumber: '12345678',
        address: [],
        roles: [],
        isActive: true,
        method: LoginMethodType.LOCAL,
      };
  
      const resultService: IRecourseUpdated<User> = {
        status: true,
        message: 'The user was updated successfully',
        recourse: userEntity
      };
  
      const userDto: UserDto = {
        id: userEntity.id,
        name: userEntity.name,
        surname: userEntity.surname,
        username: userEntity.username,
        email: userEntity.email,
        phone: userEntity.phone,
        idType: userEntity.idType,
        idNumber: userEntity.idNumber,
        address: userEntity.address,
        roles: userEntity.roles,
        method: userEntity.method
      };
  
      const expectedResponse: IRecourseUpdated<UserDto> = {
        status: true,
        message: 'The user was updated successfully',
        recourse: userDto
      };
  
      jest.spyOn(service, 'update').mockResolvedValue(resultService);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue(userDto);
  
      expect(await controller.putUpdate(id, dto)).toEqual(expectedResponse);
    });
  });

  describe('remove', () => {
    it('should delete a user by id', async () => {
      const id = 1;
      const userEntity: User = {
        id: id,
        name: 'Test',
        surname: 'User',
        username: 'testuser',
        email: 'test@example.com',
        phone: '+541234567890',
        idType: { id: 1 } as unknown as IdType,
        idNumber: '12345678',
        address: [],
        roles: [],
        isActive: true,
        method: LoginMethodType.LOCAL
      };

      const result: IRecourseDeleted<User> = {
          status: true,
          message: 'The user was deleted successfully',
          recourse: userEntity
      };

      const userDto: UserDto = {
        ...userEntity
      };

      const resultController: IRecourseDeleted<UserDto> = {
        ...result,
        recourse: userDto
      }

      jest.spyOn(service, 'remove').mockResolvedValue(result);
      jest.spyOn(service, 'mapUserToUserDto').mockReturnValue(userDto);

      expect(await controller.remove(id)).toEqual(resultController);
    });
  
    it('should throw NotFoundException if user is not found', async () => {
      const id = 999; // Assuming this ID does not exist
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());
  
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  
    it('should throw BadRequestException if there is an error deleting the user', async () => {
      const id = 1;
      jest.spyOn(service, 'remove').mockRejectedValue(new BadRequestException());
  
      await expect(controller.remove(id)).rejects.toThrow(BadRequestException);
    });
  });
});