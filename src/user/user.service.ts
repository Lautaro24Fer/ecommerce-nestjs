import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PartialUpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/entities/role.entity';
import { UserDto } from './dto/user.dto';
import { EmailService } from '../email/email.service';
import { IdTypeService } from '../id-type/id-type.service';
import { IdType } from '../id-type/entities/id-type.entity';
import { AuthUserResponseDto, CreateUserStrategyDto } from './dto/oauth-data';
import { IBadRequestex, INotFoundEx, IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated, IUnauthorizedEx } from '../global/responseInterfaces';
import { AddressService } from '../address/address.service';
import { Address } from '../address/entities/address.entity';
import { UpdateType } from '../global/enum';

enum UniqueUserRecourse { USERNAME, EMAIL, ID_NUMBER };

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly roleService: RolesService,
    private readonly emailService: EmailService,
    private readonly idTypeService: IdTypeService,
    private readonly addressService: AddressService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(password, salt);
    return hash;
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    if((!password) || (password === "")) {
      const unauthorizedError: IUnauthorizedEx = {
        status: false,
        message: "The password can not be a empty string"
      };
      throw new UnauthorizedException(unauthorizedError);
    }
    return await bcrypt.compare(password, hash);
  }

  async create(createUserDto: CreateUserDto): Promise<IRecourseCreated<User>> {

    const emailExists: boolean = await this.recourseInUse(createUserDto.email.toLowerCase(), UniqueUserRecourse.EMAIL);
    if(emailExists){
      const response: IBadRequestex = { status: false, message: `User with '${createUserDto.email}' already exists` };
      throw new BadRequestException(response);
    }

    const usernameExists = await this.recourseInUse(createUserDto.username, UniqueUserRecourse.USERNAME);
    if(usernameExists){
      const response: IBadRequestex = { status: false, message: `User with username '${createUserDto.username}' already exists` };
      throw new BadRequestException(response);
    }

    const identificationNumber: boolean = await this.recourseInUse(createUserDto.idNumber.toString(), UniqueUserRecourse.ID_NUMBER);
    if(identificationNumber){
      const response: IBadRequestex = { status: false, message: `User with identification number '${createUserDto.idNumber}' already exists` };
      throw new BadRequestException(response);
    }

    createUserDto.password = await this.hashPassword(createUserDto.password);
    createUserDto.username = createUserDto.username.toLocaleLowerCase();

    const idTypeOfUser: IdType = (await this.idTypeService.findOne(createUserDto.idType)).recourse; 

    let addressCreated: Address[] = [];

    if(createUserDto.address) {
      addressCreated = await Promise.all(createUserDto.address.map(async (add) =>{
        const addressCreatedOrFound: Address = (await this.addressService.findOrCreate(add)).recourse;
        return addressCreatedOrFound;
      }));
    }
    
    const createUser: User = this.userRepository.create({
      ...createUserDto, 
      email: createUserDto.email.toLowerCase(),
      roles: [], 
      idType: idTypeOfUser, 
      idNumber: createUserDto.idNumber.toString(), 
      address: [...addressCreated]
    });
    const role: Role = (await this.roleService.findOneByName('user')).recourse;
    createUser?.roles?.push(role);

    const userSaved: User = await this.userRepository.save(createUser).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error saving the user created"
      };
      throw new BadRequestException(badRequestError);
    });

    const userCreated: User = (await this.findOneById(userSaved.id)).recourse;

    if(!userCreated){
      const response: INotFoundEx = { status: false, message: `The created user with id '${userSaved.id}' was not found` };
      throw new NotFoundException(response);
    }

    const response: IRecourseCreated<User> = {
      status: true,
      message: 'The user was created succesfully',
      recourse: userCreated
    };

    return response;
  }

  async findAll(): Promise<IRecourseFound<UserDto[]>> {

    const users: User[] = await this.userRepository.find({ where: { isActive: true }, relations: ['roles', 'idType', 'address'] }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error finding the users in the db"
      };
      throw new BadRequestException(badRequestError);
    });
    const usersParsed: UserDto[] = users.map((user) => {
      return this.mapUserToUserDto(user);
    })
    const response: IRecourseFound<UserDto[]> = {
      status: true,
      message: 'The users was loaded succesfully',
      recourse: usersParsed
    };
    return response;
  }

  async findOneById(id: number): Promise<IRecourseFound<User>> {
    const user: User = await this.userRepository.findOne({ where: { id, isActive: true }, relations: ['roles', 'idType', 'address']}).catch((error) => {
      const response: IBadRequestex = { status: false, message: `Error finding the user with id '${id}'` };
      console.error(error);
      throw new BadRequestException(response);
    });
    if (!user) {
      const response: INotFoundEx = { status: false, message: `The user with id '${id}' was not found` };
      throw new NotFoundException(response);
    }

    const recourseResponse: IRecourseFound<User> = {
      status: true,
      message: 'The user was found succesfully by id',
      recourse: user
    };
    
    return recourseResponse;
  }

  async findOneByUserName(username: string): Promise<IRecourseFound<User>> {


    const user: User = await this.userRepository.findOne({ where: { username: username.toLowerCase(), isActive: true }, relations: ['roles', 'idType', 'address'] }).catch((error) => {
      const response: IBadRequestex = { status: false, message: `Error finding the user with username '${username}'` };
      console.error(error);
      throw new BadRequestException(response)
    });
    if (!user) {
      const response: INotFoundEx = { status: false, message: `The user with username '${username}' was not found` };
      throw new NotFoundException(response);
    }
    const response: IRecourseFound<User> = {
      status: true,
      message: 'The user was found succesfully by username',
      recourse: user
    }
    return response;
  }

  async findOneByEmail(email: string): Promise<IRecourseFound<User>> {

    if(!this.validateEmail(email)){
      const badRequestError: IBadRequestex = {
        status: false,
        message: 'The email arrived have a incorrect format'
      };
      throw new BadRequestException(badRequestError);
    }
    const user: User = await this.userRepository.findOne({ where: { email, isActive: true }, relations: ['roles', 'idType', 'address'] }).catch((error) => {
      const response: IBadRequestex = { status: false, message: `Error finding the user with email '${email}'` };
      console.error(error);
      throw new BadRequestException(response)
    })
    if (!user) {
      const response: INotFoundEx = { status: false, message: `The user with email '${email}' was not found` }
      throw new NotFoundException(response);
    }

    const userResponse: IRecourseFound<User> = {
      status: true,
      message: 'The user was found succesfully by email',
      recourse: user
    }
    return userResponse;
  }

  async findOneByUsernameOrEmail(input: string): Promise<IRecourseFound<User>> {
    
    const isEmail: boolean = await this.validateEmail(input);
    if(isEmail){
      const userByEmail: IRecourseFound<User> = await this.findOneByEmail(input)
      return userByEmail;
    }
    const userByUsername: IRecourseFound<User> = await this.findOneByUserName(input);
    return userByUsername;
  }

  async validateEmail(input: string): Promise<boolean>{
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input);
  }

   async findOneByCookie(cookieOnRequest: string): Promise<IRecourseFound<User>> {
    const userDecoded: any = await this.jwtService.decode(cookieOnRequest);
    const userOnDB: IRecourseFound<User> = await this.findOneById(userDecoded.id);
    return userOnDB;
  }

  async responseByAuthStrategy( cookie: string ): Promise<AuthUserResponseDto | undefined> {

    const user: User = (await this.findOneByCookie(cookie)).recourse;
    const userDto: UserDto = this.mapUserToUserDto(user);
    const responseUser: AuthUserResponseDto = { user: userDto, isNewUser: false };
    if (user.username.includes('null')) {
      responseUser.isNewUser = true;
    }
    return responseUser;
  }

  async validateUserWithStrategy(payload: CreateUserStrategyDto): Promise<User> {

    const user: User = await this.findOneByEmail(payload.email).then(data => data.recourse)
    .catch(async (error) => {
      if (error instanceof NotFoundException) {
        const role: Role = (await this.roleService.findOneByName('user')).recourse;
        const idType: IdType = (await this.idTypeService.findOne(payload.idType)).recourse;
        
        const createUser = {
          name: payload.name,
          surname: payload.surname,
          username: payload.username,
          postalCode: payload.postalCode ?? '',
          idNumber: payload.idNumber ?? '',
          email: payload.email,
          method: payload.method,
          roles: [],
          idType: { ...idType },
        };
        createUser.roles.push(role);
        const userCreated: User = await this.userRepository.save(createUser).catch((error) => {
          const response: IBadRequestex = { status: false, message: 'Error in the creation of the user in strategy validation' };
          console.error(error)
          throw new BadRequestException(response);
        });
        return userCreated;
      }
      else{
        throw new BadRequestException(error);
      }
    })
    return user;
  }
  // Verifica si datos unicos como el username o el correo están en uso
  async recourseInUse( input: string, recourseName: UniqueUserRecourse ): Promise<boolean>{

    // La idea de enviar un id de manera opcional es en caso de que se deba obviar la id 
    // para buscar el resto de registros

    let response: boolean;
    switch(recourseName){
      case (UniqueUserRecourse.EMAIL):
        response = await this.userRepository.existsBy({ email: input, isActive: true }).catch((error) => {
          const catchErrorResponse: IBadRequestex = { status: false, message: 'Error in the verification if email exists' };
          console.error(error);
          throw new BadRequestException(catchErrorResponse);
        });
      break;
      case (UniqueUserRecourse.USERNAME):
        response = await this.userRepository.existsBy({ username: input, isActive: true }).catch((error) => {
          const catchErrorResponse: IBadRequestex = { status: false, message: 'Error in the verification if username exists' };
          console.error(error);
          throw new BadRequestException(catchErrorResponse);
        });
      break;
      case (UniqueUserRecourse.ID_NUMBER): 
        response = await this.userRepository.existsBy({ idNumber: input, isActive: true }).catch((error) => {
          const catchErrorResponse: IBadRequestex = { status: false, message: 'Error in the verification if identification number exists' };
          console.error(error);
          throw new BadRequestException(catchErrorResponse);
        });
      break;
      default:
        const catchErrorResponse: IBadRequestex = { status: false, message: 'Error in the verification if the recourse exists' };
        throw new BadRequestException(catchErrorResponse);
      break;
    }
    return response;
  }

  async update( id: number, updateUserDto: PartialUpdateUserDto, updateType: UpdateType ): Promise<IRecourseUpdated<User>> {

    const userToUpdate: User = (await this.findOneById(id)).recourse;

    // -- validar que el email está en uso

    if((updateUserDto?.email) && (updateUserDto?.email !== userToUpdate.email)){
      const emailExists: boolean = await this.recourseInUse(updateUserDto?.email, UniqueUserRecourse.EMAIL);
      if(emailExists){
        const badRequestError: IBadRequestex = {
          status: false,
          message: `The email '${updateUserDto?.email}' is currently in use`,
        }
        throw new BadRequestException(badRequestError);
      }
    }

    // -- validar que el username está en uso

    if((updateUserDto?.username) && (updateUserDto?.username !== userToUpdate.username)){
      const usernameExists: boolean = await this.recourseInUse(updateUserDto?.username, UniqueUserRecourse.USERNAME);
  
      if(usernameExists){
        const badRequestError: IBadRequestex = {
          status: false,
          message: `The username '${updateUserDto?.username}' is currently in use`,
        }
        throw new BadRequestException(badRequestError);
        
      }
    }

    // -- validar que el numero de identificación no está en uso

    if((updateUserDto?.idNumber) && (updateUserDto?.idNumber.toString() !== userToUpdate.idNumber)) {
      const idNumberExists: boolean = await this.recourseInUse(updateUserDto?.idNumber.toString(), UniqueUserRecourse.ID_NUMBER);
      if(idNumberExists) {
        const badRequestError: IBadRequestex = {
          status: false,
          message: `The idNumber '${updateUserDto?.idNumber}' is currently in use`,
        }
        throw new BadRequestException(badRequestError);
      }
    }

    const body: User = {
      id: userToUpdate?.id,
      isActive: true,
      name: updateUserDto?.name ?? userToUpdate?.name,
      surname: updateUserDto?.surname ?? userToUpdate?.surname,
      username: updateUserDto?.username ?? userToUpdate?.username,
      idType: userToUpdate?.idType,
      idNumber: updateUserDto?.idNumber?.toString() ?? userToUpdate?.idNumber,
      email: userToUpdate?.email,
      method: userToUpdate?.method,
      address: [...(userToUpdate?.address || [])],
      roles: [...(userToUpdate?.roles || [])],
      phone: updateUserDto?.phone
    };

    if(updateUserDto?.idType) {
      const idTypeArrived: IdType = (await this.idTypeService.findOne(updateUserDto?.idType)).recourse;
      body.idType = idTypeArrived;
    }

    if((updateUserDto?.address)){
      if(updateType === UpdateType.FULL){
        body.address = [];
      }
      else{
      }
      const addresses = await Promise.all(
        updateUserDto.address.map(async (ad) => {
          const address: Address = (await this.addressService.findOrCreate({ ...ad, addressNumber: ad.addressNumber.toString() })).recourse;
          return address;
        })
      );
    
      body.address.push(...addresses);
    }

    await this.userRepository.save(body).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: 'Error in the updating of the user'
      };
      throw new BadRequestException(badRequestError);
    });

    const userUpdated: User = (await this.findOneById(id)).recourse;


    const response: IRecourseUpdated<User> = {
      status: true,
      message: 'The recourse was updated succesfully', 
      recourse: userUpdated
    };

    return response;
  }

  async remove(id: number): Promise<IRecourseDeleted<User>> {

    const userToRemove: User = (await this.findOneById(id)).recourse;
    await this.userRepository.update(userToRemove.id, { isActive: false}).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error in removing proccess of the user with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    const userRemoved: User = await this.userRepository.findOneBy({ id, isActive: false }).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: `Error finding the user unactivated with id '${id}'`
      };
      throw new BadRequestException(badRequestError);
    });
    if(!userRemoved){
      const badRequestError: INotFoundEx = {
        status: false,
        message: `Error finding the removed user with id '${id}'`
      };
      throw new NotFoundException(badRequestError);
    };
    const response: IRecourseDeleted<User> = { 
      status: true, 
      message: 'The recourse was unactivated succesfully', 
      recourse:  userRemoved
    };
    return response;
  }
  // Manejo de correos
  generateRandomToken(): number { 
		
    // Codigo de un solo uso para poder validar el cambio de contraseña
    return Math.floor(100000 + Math.random() * 900000);
	}
  
  async resetPasswordRequest(input: string): Promise<IRecourseCreated<User>>{

    const user: User = (await this.findOneByUsernameOrEmail(input)).recourse;

    const expiresIn = new Date(Date.now() + 2 * 60 * 1000); // El codigo de correo durará 2 minutos
		const token = this.generateRandomToken();

    user.passwordResetToken = token.toString(); // el codigo podría hashearse con bcrypt
    user.passwordResetTokenExpiresIn = expiresIn;

    await this.userRepository.save(user).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error saving the reset password tokens"
      };
      throw new BadRequestException(badRequestError);
    });


    await this.emailService.sendEmailForResetPassword(token, user.email); // Envío del correo al usuario con el codigo de cambio de contraseña

    const response: IRecourseCreated<User> = {
      status: true,
      message: "The tokens was created and the email was sended succesfully",
      recourse: user
    };

    return response;
  }

  async validatePasswordResetCode(code: number, email: string): Promise<string>{

    const user: User = (await this.findOneByEmail(email)).recourse

    if(user.passwordResetToken !== code.toString()){
      const badRequestError: IBadRequestex = {
        status: false,
        message: "The code is incorrect"
      };
      throw new BadRequestException(badRequestError);
    }

    if(user.passwordResetTokenExpiresIn < new Date()){
      const badRequestError: IBadRequestex = {
        status: false,
        message: "The code is expired"
      };
      throw new BadRequestException(badRequestError);
    }

    const jwt: string = await this.jwtService.signAsync({ userId: user.id, isValidOperation: true });
    return jwt;
  }

  async resetPassword(jwt: string, newPassword: string): Promise<IRecourseUpdated<User>>{

    const decoded = await this.jwtService.decode(jwt);
    const user: User = (await this.findOneById(decoded?.userId)).recourse;

    const newPasswordCrypted: string = await this.hashPassword(newPassword);

    user.password = newPasswordCrypted;

    user.passwordResetToken = null;

    user.passwordResetTokenExpiresIn = null;

    const userUpdated = await this.userRepository.save(user).catch((error) => {
      console.error(error);
      const badRequestError: IBadRequestex = {
        status: false,
        message: "Error in the reset of the password"
      };
      throw new BadRequestException(badRequestError);
    });

    const response: IRecourseUpdated<User> = {
      status: true,
      message: "The password was updated succesfully",
      recourse: userUpdated
    };

    return response;
  }

  mapUserToUserDto(user: User): UserDto {

    const userDto: UserDto = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      method: user.method,
      roles: user.roles ?? [],
      surname: user.surname,
      idType: user.idType,
      idNumber: user.idNumber,
      address: user.address ?? [],
      phone: user.phone
    };
    return userDto;
  }
}
