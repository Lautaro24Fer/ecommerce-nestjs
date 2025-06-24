import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Req,
  BadRequestException,
  Res,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FullUpdateUserDto, PartialUpdateUserDto  } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard, ITokenPayload } from '../auth/auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserDto } from './dto/user.dto';
import { ResetUserPasswordGuard } from './user.guard';
import { AuthUserResponseDto } from './dto/oauth-data';
import { RequestUpdatePasswordCodeDto, ResponsetUpdatePasswordCodeDto, UpdateUserPasswordDto, ValidateUpdateUserPasswordCodeDto } from './dto/password-change';
import { IRecourseCreated, IRecourseDeleted, IRecourseFound, IRecourseUpdated, IUnauthorizedEx } from '../global/responseInterfaces';
import { UpdateType } from '../global/enum';
import { Address } from '../address/entities/address.entity';
import { Roles } from '../auth/auth.decorator';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Register succesfull',
    type: User,
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Error creating the new user' 
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<IRecourseCreated<UserDto>> {
    const userCreated: IRecourseCreated<User> = await this.userService.create(createUserDto);
    const userParsed: UserDto = this.userService.mapUserToUserDto(userCreated.recourse);
    const response: IRecourseCreated<UserDto> = {
      ...userCreated,
      recourse: userParsed
    }
    return response;
  }

  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All users loaded',
    type: User,
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Error loading all users' 
  })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Get()
  async findAll(): Promise<IRecourseFound<UserDto[]>> {
    const response: IRecourseFound<UserDto[]> = await this.userService.findAll();
    return response;
  }

  @ApiOperation({ summary: 'Get user authenticated by the cookie' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All users loaded',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request, error loading the authenticated user' 
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Error loading the authenticated user, unauthoraized exception'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get('cookie')
  async findOneAuthenticated(@Req() req: Request): Promise<AuthUserResponseDto | undefined> {
    try {
      const responseUser: AuthUserResponseDto = await this.userService.responseByAuthStrategy(req.cookies['user']);
      return responseUser;
    } 
    catch {
      throw new BadRequestException({ error: 'Error getting user authenticated' });
    }
  }

  // CAMBIO DE CONTRASEÑA
  @ApiOperation({
		summary: 'Send a email code for validate the identity of the user'
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Mail sended succesfully'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Mail was not sended succesfully'
	})
  @Post('/reset-pass-code')
  async getResetPasswordCode(@Body() updateUserPassword: RequestUpdatePasswordCodeDto): Promise<IRecourseCreated<UserDto>>{
    const user: IRecourseCreated<User> = await this.userService.resetPasswordRequest(updateUserPassword.usernameOrEmail);
    const userParsed: UserDto = this.userService.mapUserToUserDto(user.recourse);
    const response: IRecourseCreated<UserDto> = {
      ...user,
      recourse: userParsed
    };
    return response;
  }

  @ApiOperation({
    summary: 'Validation of the code passed by email for update password'
  })
  @ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Code validated succesfully'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Error validating code'
	})
  @Post('/reset-pass-validate-code')
  async validateResetPasswordCode(@Body() updateUserPasswordValidate: ValidateUpdateUserPasswordCodeDto, @Res() res: Response): Promise<Response> {

    const jwt: string = await this.userService.validatePasswordResetCode(updateUserPasswordValidate.code, updateUserPasswordValidate.email);
    res.cookie('password-reset', jwt, {
      maxAge: 1000 * 60 * 5, // El jwt durará 5 min
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    const responseDto: ResponsetUpdatePasswordCodeDto = { status: true, description: 'Code verified succesfully' };
    return res.status(201).json(responseDto);
  }

  @ApiOperation({
    summary: 'Once validated, update password by temporally jwt'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated succesfully'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error updating the password'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Time expired to update password'
  })
  @UseGuards(ResetUserPasswordGuard)
  @Put('/reset-pass')
  async resetPassword(@Req() req: Request , @Res() res: Response, @Body() updateUserPasswordDto: UpdateUserPasswordDto): Promise<Response>{

    const jwt: string = req.cookies['password-reset'];

    if(!jwt){
      const unauthError: IUnauthorizedEx = {
        status: false,
        message: "No jwt in the request"
      }
      throw new UnauthorizedException(unauthError);
    }

    const userUpdated: IRecourseUpdated<User> = await this.userService.resetPassword(jwt, updateUserPasswordDto.newPassword);
    res.cookie('password-reset', '', { httpOnly: true, expires: new Date(0) });
    const userParsed: UserDto = this.userService.mapUserToUserDto(userUpdated.recourse);
    const response: IRecourseUpdated<UserDto> = {
      ...userUpdated,
      recourse: userParsed
    };
    return res.status(201).json(response);
  }

  @ApiOperation({ summary: "Get all addresses asociated an a user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The addresses was loaded succesfully"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error loading the user addresses"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Not authorized to load all addresses of a user"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "The id user was not found in database"
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get('addresses/:id')
  async getUserAddresses(@Param('id') id: number, @Req() req: Request): Promise<IRecourseFound<Address[]>>{

    const userToken: string = req?.cookies['user'];
    // Esta interfaz deberia estar en global
    const userPayload: ITokenPayload = await this.jwtService.decode(userToken);
    const isUser = userPayload.roles.findIndex((m) => m.name === 'user') >= 0;
    if ((isUser) && (userPayload?.id != id)) {
      const unauthError: IUnauthorizedEx = {
        status: false,
        message: `User ID '${id}' does not match the token ID`
      }
      throw new UnauthorizedException(unauthError);
    }

    const recourseFound: IRecourseFound<User> = await this.userService.findOneById(id);
    const addresses: Address[] = [...recourseFound.recourse.address];
    const response: IRecourseFound<Address[]> = {
      status: true,
      message: "All addresses was found succesfully",
      recourse: addresses
    };
    return response;
  }
  

  @ApiOperation({ summary: 'Find one user by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User loaded sucessfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The user was not found',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request, error loading the user' 
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Can not load the user, unauthorized request'
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IRecourseFound<UserDto>> {
    const user: IRecourseFound<User> = await this.userService.findOneById(id);
    const userParsed: UserDto = this.userService.mapUserToUserDto(user.recourse);
    const response: IRecourseFound<UserDto> = {
      ...user,
      recourse: userParsed
    };
    return response;
  }

  @ApiOperation({ summary: 'Update partially one user by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user was updated succesfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The user was not found',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request, error updating the user' 
  })
 @UseGuards(AuthGuard)
  @Roles(['admin', 'user'])
  @Patch(':id')
  async patchUpdate( @Param('id') id: number, @Body() updateUserDto: PartialUpdateUserDto ): Promise<IRecourseUpdated<UserDto>> {
    const userUpdated: IRecourseUpdated<User> = await this.userService.update(id, updateUserDto, UpdateType.PARTIAL);
    const userParsed: UserDto = this.userService.mapUserToUserDto(userUpdated.recourse);
    const response: IRecourseUpdated<UserDto> = {
      ...userUpdated,
      recourse: userParsed
    };
    return response;
  }

  @ApiOperation({ summary: 'Full update one user by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user was updated succesfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The user was not found',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request, error updating the user' 
  })
 @UseGuards(AuthGuard)
  @Roles(['user', 'admin'])
  @Put(':id')
  async putUpdate( @Param('id') id: number, @Body() updateUserDto: FullUpdateUserDto ): Promise<IRecourseUpdated<UserDto>> {
    const userUpdated: IRecourseUpdated<User> = await this.userService.update(id, updateUserDto, UpdateType.FULL);
    const userParsed: UserDto = this.userService.mapUserToUserDto(userUpdated.recourse);
    const response: IRecourseUpdated<UserDto> = {
      ...userUpdated,
      recourse: userParsed
    };
    return response;
  }

  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user was deleted succesfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized operation require login',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Unauthorized operation require permises',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The user was not found',
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request, error deleting the user' })
 @UseGuards(AuthGuard)
  @Roles(['admin'])
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<IRecourseDeleted<UserDto>> {
    const userRemoved: IRecourseDeleted<User> = await this.userService.remove(id);
    const userParsed: UserDto = this.userService.mapUserToUserDto(userRemoved.recourse);
    const response: IRecourseDeleted<UserDto> = {
      ...userRemoved,
      recourse: userParsed
    };
    return response;
  }
}