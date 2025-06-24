import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './auth-google.guard';
import { InputLoginDto, LoginResponseDto } from './dto/login.dto';
import { SessionStateDto } from './dto/session-state.dto';
import { IRecourseCreated, IRecourseDeleted, IUnauthorizedEx } from '../global/responseInterfaces';
import { Roles } from './auth.decorator';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  clientUrl: string;

  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    this.clientUrl = configService.get<string>('PROD_CLIENT_DOMAIN');
  }

  @ApiOperation({
    summary: "User login by local way. With username or email and password"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The login was accepted succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "The credentials not match"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error in loggin"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "The user was not found"
  })
  @Post('login/local')
  async login( @Body() login: InputLoginDto, @Res() res: Response ): Promise<void> {

    if((login.password.trim()).length < 8){
      const unauthError: IUnauthorizedEx = {
        status: false,
        message: "The password with no-empty spaces must be equal or more than 8 characters"
      };
      throw new UnauthorizedException(unauthError);
    }

    const { token, refreshToken } = await this.authService.getCookieByLocalAuth(login);

    res.cookie('user', token, {
        maxAge: 1000 * 60 * 60, // Tiempo de vida de la cookie (1 hora)
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    res.cookie('refresh', refreshToken, {
      maxAge: 1000 * 60 * 60  * 2, // Tiempo de vida de la cookie (2 horas)
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    const responseLogin = new LoginResponseDto(true, 'login succesfully');

    res.status(201).json(responseLogin);
  }

  @ApiOperation({
    summary: "Login the session with google oauth. Not testeable in swagger"
  })
  @UseGuards(GoogleAuthGuard)
  @Get('login/google')
  async googleLogin() {
    return { msg: 'google authentication' };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('login/google/redirect')
  async googleLoginCallback(@Req() req: Request, @Res() res: Response): Promise<void> {

    const error = req.query['error'];

    if((!error) || (error !== 'access_denied')){
      const user: any = { ...req.user };

      const { token, refreshToken } = await this.authService.getCookieByPassportStrategy( user );

      res.cookie('user', token, {
        maxAge: 1000 * 60 * 60, // Tiempo de vida de la cookie (1 hora)
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie('refresh', refreshToken, {
        maxAge: 1000 * 60 * 60 * 2, // Tiempo de vida de la cookie (2 horas)
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    }

    return res.redirect(this.clientUrl); // Esta es la pagina a donde va a redirigir una vez logeado o no
  }

  @ApiOperation({
    summary: "Get the session status"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Session returned succesfully"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error getting the session state"
  })
 @UseGuards(AuthGuard)
  @Roles(['user', 'admin'])
  @Get('status')
  async isLogged(@Req() req: Request): Promise<SessionStateDto>{
    const refreshToken: any = req.cookies['refresh']
    const accessToken: any = req.cookies['user']
    const response: SessionStateDto = await this.authService.getSessionStatue(accessToken, refreshToken)
    return response;
  }

  
  @ApiOperation({
    summary: "Refresh of the token for extend the session"
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The token was refreshed succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "The refreshing process was not validate for this user"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error in the refresh of the token"
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "The user in the token was not found"
  })
 @UseGuards(AuthGuard)
  @Roles(['user', 'admin'])
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<Response>{
    const refreshToken: string = req.cookies['refresh']
    if(!refreshToken){
      const unauthError: IUnauthorizedEx = {
        status: false,
        message: "any refresh token, please login again"
      };
      throw new UnauthorizedException(unauthError);
    }
    const response: boolean = await this.authService.verifyJwtIsExpired(refreshToken)
    if(!response){
      const unauthError: IUnauthorizedEx = {
        status: false,
        message: "The refresh token was expired, please login again"
      };
      throw new UnauthorizedException(unauthError)
    }
    const accessToken: string = await this.authService.getTokenRefreshed(refreshToken)
    res.cookie('user', accessToken, {
      maxAge: 1000 * 60 * 60 * 1, // Tiempo de vida de la cookie (1 hora)
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    const recourse: IRecourseCreated<string> = {
      status: true,
      message: "Token refreshed succesfully",
      recourse: accessToken
    };
    return res.status(201).json(recourse)
  }

  @ApiOperation({
    summary: "Close the current session"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "The session was closed succesfully"
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "The logout process was not validate for this user"
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Error in the logout of the session"
  })
 @UseGuards(AuthGuard)
  @Roles(['user', 'admin'])
  @Post('logout')
  logout(@Res() res: Response): Response{
    res.cookie('user', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('refresh', '', { httpOnly: true, expires: new Date(0) });
    const recourseCreated: IRecourseDeleted<null> = {
      status: true,
      message: "Logout successfully",
      recourse: null
    }
    return res.status(200).json(recourseCreated);
  }

}
