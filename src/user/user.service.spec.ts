import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { EmailService } from '../email/email.service';
import { IdTypeService } from '../id-type/id-type.service';
import { AddressService } from '../address/address.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Address } from '../address/entities/address.entity';
import { IdType } from '../id-type/entities/id-type.entity';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateType } from '../global/enum';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let roleService: RolesService;
  let emailService: EmailService;
  let idTypeService: IdTypeService;
  let addressService: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findOneByName: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmailForResetPassword: jest.fn(),
          },
        },
        {
          provide: IdTypeService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AddressService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    roleService = module.get<RolesService>(RolesService);
    emailService = module.get<EmailService>(EmailService);
    idTypeService = module.get<IdTypeService>(IdTypeService);
    addressService = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hash = await service.hashPassword(password);
      expect(hash).not.toEqual(password);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'password123';
      const hash = await service.hashPassword(password);
      const result = await service.comparePasswords(password, hash);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for empty password', async () => {
      await expect(service.comparePasswords('', 'somehash')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        idNumber: 1,
        idType: 1,
        address: [],
        name: '',
        surname: '',
        phone: ''
      };
  
      const savedUser = { ...createUserDto, id: 1 }; // Ensure the saved user has an id
  
      jest.spyOn(userRepository, 'create').mockReturnValue(savedUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser as any);
      jest.spyOn(service, 'recourseInUse').mockResolvedValue(false);
      jest.spyOn(idTypeService, 'findOne').mockResolvedValue({ recourse: {} } as any);
      jest.spyOn(roleService, 'findOneByName').mockResolvedValue({ recourse: {} } as any);
      jest.spyOn(service, 'findOneById').mockResolvedValue({ status: true, recourse: savedUser } as any);
  
      const result = await service.create(createUserDto as any);
      expect(result).toBeDefined();
      expect(result.status).toBe(true);
    });

    it('should throw BadRequestException if email is in use', async () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        idNumber: '123456789',
        idType: 1,
        address: [],
      };

      jest.spyOn(service, 'recourseInUse').mockResolvedValue(true);

      await expect(service.create(createUserDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: User[] = [{ id: 1, username: 'testuser' }] as unknown as User[];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users as any);
  
      const result = await service.findAll();
      expect(result.status).toBe(true);
  
      // Check only the properties you care about
      const expectedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
      }));
  
      const receivedUsers = result.recourse.map(user => ({
        id: user.id,
        username: user.username,
      }));
  
      expect(receivedUsers).toEqual(expectedUsers);
    });
  });
  
  describe('findOneById', () => {
      it('should return a user by id', async () => {
        const user: User = { id: 1, username: 'testuser' } as unknown as User;
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
  
        const result = await service.findOneById(1);
        expect(result.status).toBe(true);
        expect(result.recourse).toEqual(user);
      });
  
      it('should throw NotFoundException if user is not found', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
  
        await expect(service.findOneById(1)).rejects.toThrow(NotFoundException);
      });
  });

  describe('findOneByUserName', () => {
    it('should return a user by username', async () => {
      const user = { id: 1, username: 'testuser' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
  
      const result = await service.findOneByUserName('testuser');
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(user);
    });
  
    it('should throw NotFoundException if user is not found by username', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
  
      await expect(service.findOneByUserName('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
  
      const result = await service.findOneByEmail('test@example.com');
      expect(result.status).toBe(true);
      expect(result.recourse).toEqual(user);
    });
  
    it('should throw NotFoundException if user is not found by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
  
      await expect(service.findOneByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  }); 
  
  describe('update', () => {
    it('should update a user', async () => {
      const user: User = { id: 1, username: 'testuser' } as unknown as User;
      const updateUserDto = { username: 'updateduser' };
  
      // Mock the repository methods
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(false); // Ensure username is not in use
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...user, ...updateUserDto } as any);
      jest.spyOn(service, 'findOneById').mockResolvedValue({ status: true, recourse: { ...user, ...updateUserDto } } as any);
  
      // Call the update method
      const result = await service.update(1, updateUserDto, UpdateType.PARTIAL);
  
      // Assertions
      expect(result.status).toBe(true);
      expect(result.recourse.username).toEqual('updateduser');
    });
  
    it('should throw BadRequestException if email is already in use', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const updateUserDto = { email: 'existing@example.com' };
  
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'existsBy').mockResolvedValue(true); // Mock existsBy to return true
  
      await expect(service.update(1, updateUserDto, UpdateType.PARTIAL)).rejects.toThrow(BadRequestException);
    });
  });
  
  describe('remove', () => {
    it('should deactivate a user', async () => {
      const user = { id: 1, isActive: true } as User;
      const deactivatedUser = { ...user, isActive: false };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined); // `update` doesn't return the updated entity
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(deactivatedUser);

      const result = await service.remove(1);
      expect(result.status).toBe(true);
      expect(result.recourse.isActive).toBe(false);
    });

    it('should throw NotFoundException if user is not found for removal', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  }); 

  // Add more tests for other methods like findAll, findOneById, update, remove, etc.
});