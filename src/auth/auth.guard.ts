import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Roles } from './auth.decorator';
import { IUnauthorizedEx } from '../global/responseInterfaces';

interface ITokenPayloadOrError {
  error?: string;
  payload?: object;
}

export interface IRole {
  id: number;
  name: string;
}

export interface ITokenPayload {
  id: number;
  method: 'local' | 'google'; // Asumiendo que solo hay estos dos métodos
  roles: IRole[];
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctxHttp = context.switchToHttp();
    const request = ctxHttp.getRequest();
  
    const token: string = this.extractTokenFromCookie(request, 'user');
    const refreshToken: string = this.extractTokenFromCookie(request, 'refresh');

    // console.log("==== GUARD ====")
    // console.log("Estos son los tokens");
    // console.log("accessToken:")
    // console.log(JSON.stringify(token, null, 2))
    // console.log("refreshToken:")
    // console.log(JSON.stringify(refreshToken, null, 2))
  
    if (!token && !refreshToken) {
      // console.log('No hay tokens, se retornara 401');
      throw new UnauthorizedException('any token in header request');
    }
  
    // console.log("BIEN, HAY TOKENS");
    // console.log("Se revisará el payload del refresh token")
    const refreshTokenPayload: any = await this.verifyTokenOrError(refreshToken);

    // console.log("Este es el payload del refresh token")
    // console.log(JSON.stringify(refreshTokenPayload))
    if (refreshTokenPayload?.error) {
    //  console.log("Hubo un error al revisar el payload del refresh token")
      // console.log('Refresh token error:', refreshTokenPayload.error);
      throw new UnauthorizedException({
        status: false,
        message: 'The session expired.',
      });
    }
    if (this.isPayloadInvalid(refreshTokenPayload.payload)) {
      // console.log("El payload del refresh token es inválido");
      // console.log(refreshTokenPayload.payload)
      let refreshRolesArray = Array.isArray(refreshTokenPayload.payload.roles);
      // console.log("El array de roles es efectivamente un array?: " + refreshRolesArray);
      let rolesLenght = refreshTokenPayload.payload.roles.length
      // console.log("Cantidad de roles del array: " + rolesLenght)
      throw new UnauthorizedException({
        status: false,
        message: 'Invalid refresh token payload.',
      });
    }
    // console.log("Se revisará el payload del access token")
  
    let tokenPayload: any = await this.verifyTokenOrError(token);
    // console.log("Este es el payload del access token")
    // console.log(JSON.stringify(tokenPayload))
  
    if (tokenPayload?.error) {
    //  console.log("Hubo un error al revisar el payload del access token")
      // console.log('Access token error:', tokenPayload.error);
      throw new UnauthorizedException({
        status: false,
        message: 'The access token is expired. Please refresh the token again',
      });
    }
    if (this.isPayloadInvalid(tokenPayload.payload)) {
      // console.log("El payload del refresh token es inválido");
      if (Array.isArray(refreshTokenPayload.payload.roles) && refreshTokenPayload.payload.roles.length === 0) {
        throw new UnauthorizedException({
          status: false,
          message: 'No roles in the token',
        });
      }
      throw new UnauthorizedException({
        status: false,
        message: 'Invalid access token payload.',
      });
    }

    // console.log("BIEN, SE PUDIERON ACCEDER A LOS PAYLOADS DE LOS TOKENS")
    // console.log("Ahora se revisará los roles que requiere el controlador para consumir el recurso")

    const roles = this.reflector.get(Roles, context?.getHandler());
    // console.log("Estos son los roles que pide el recurso")
    // console.log(roles)
  
    if (!roles) {
      // console.log("Ok, en este caso no pide un rol en especifico")
      // console.log("se permite consnumo")
      request['user'] = token;
      request['refresh'] = refreshToken;
      return true;
    }

    // console.log("Bien, ya conocemos que role requiere el recurso")
    // console.log("Analizaremos los roles en el access token dado")
    
    const userRoles = (await this.jwtService.decode(token));
    // console.log('Este es el token decodeado:', userRoles);

    // console.log("Ahora nos fijaremos si es administrador (en ese caso siempre podrá tener acceso al recurso)")
  
    const rolesArray = userRoles?.roles; // Asegúrate de que esto sea un arreglo

    let isAdmin: boolean;

    if (Array.isArray(rolesArray)) {

      if(rolesArray.length < 1){
        const unauthorizedError: IUnauthorizedEx = {
          status: false,
          message: 'No roles in the token'
        };
        throw new UnauthorizedException(unauthorizedError);
      }
      isAdmin = rolesArray.findIndex((r: { name: string; }) => r?.name === 'admin') >= 0;

    if (isAdmin) {
      // console.log("Efectivamente, es administrador. Se retorna true");
      request['user'] = token;
      request['refresh'] = refreshToken;
      return true;
    }
    } else {
      console.error("userRoles.role no es un arreglo o está indefinido");
      return false;
    } 


    // console.log("EL USUARIO ACTUALMENTE NO ES ADMINISTRADOR")
    // console.log("Buscaremos saber si el recurso requiere permisos de adminisrtador")

    // console.log("Es admin?: ", isAdmin)

    if ((roles?.includes('admin') && (!(roles?.includes('user')))) && (!isAdmin)) {
      // console.log("No es administrador y requerimos ese permiso, se retorna false")
      return false;
    }

    // console.log("NO REQUIERE ADMIN")
    // console.log("Buscaremos si requiere role de user")

    const requireUserRole: boolean = (roles.findIndex(r => r === 'user') >= 0);

    // console.log("requiere rol de user?: " + requireUserRole);

    const isUser: boolean = rolesArray.findIndex((r: { name: string; }) => r?.name === 'user') >= 0;
    // console.log("El cliente tiene rol de usuario?: " + isUser);
  
    if ((!isUser) && (requireUserRole)) {
      // console.log('User role required but not present');
      return false;
    }

    // console.log("PERFECTO, NO REQUIERE ROLES ADICIONALES")
    // console.log("Se retorna true finalmente")
  
    request['user'] = token;
    request['refresh'] = refreshToken;
    return true;
  }

  isPayloadInvalid(payload: ITokenPayload): boolean {
    if (!payload) {
      return true; // El payload es null o undefined
    }
  
    // Verifica que el payload tenga los campos esperados y que sean válidos
    if (typeof payload.id !== 'number' || payload.id < 0) { // Cambiado de < 1 a < 0
      return true; // 'id' debe ser un número no negativo
    }
  
    let isLoggedByGoogleMethod: boolean = payload.method.toLowerCase() === 'google';
    let isLoggedByLocalMethod: boolean = payload.method.toLowerCase() === 'local';
  
    if (typeof payload.method !== 'string') {
      return true; 
    }
  
    if ((!isLoggedByGoogleMethod) && (!isLoggedByLocalMethod)) {
      return true; // 'method' debe ser 'google' o 'local'
    }
  
    if (!Array.isArray(payload.roles) || payload.roles.length === 0) {
      return true; // 'roles' debe ser un array no vacío
    }
  
    return false; // El payload es válido
  }

  async verifyTokenOrError(token: string): Promise<ITokenPayloadOrError>{
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const response: ITokenPayloadOrError = {
        payload
      }
      return response;
    }
    catch(error){
      if(error.name === 'TokenExpiredError'){
        const response: ITokenPayloadOrError = {
          error: 'Token expired'
        }
        return response;
      }
      const response: ITokenPayloadOrError = {
        error: 'Invalid token'
      }
      return response;
    }
  }

  extractTokenFromCookie(request: Request, alias: string) {
    const token: string = request.cookies[alias]
    return token
  }
}
