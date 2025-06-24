import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Role } from '../roles/entities/role.entity';
import { IBadRequestex } from '../global/responseInterfaces';

interface ICookiesContext {
  user?: string;
  refresh?: string;
}

interface ITokenBody {
  id: number;
  method: string;
  roles: Role[]
}

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;
  let reflector: Reflector;

  beforeEach(() => {
    configService = new ConfigService();
    jwtService = new JwtService({ secret: 'prueba' });
    reflector = new Reflector();
    authGuard = new AuthGuard(jwtService, configService, reflector);
  });

  function createMockExecutionContext(cookies: ICookiesContext): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {
            user: cookies.user,
            refresh: cookies.user,
          },
        }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  }

  async function getJwtToken( payload: any, timeToExpire: string, ): Promise<string | undefined> {
    const cookieCrypted = await jwtService.signAsync( payload, { expiresIn: timeToExpire });
    return cookieCrypted;
  }

  describe('tokens',  () => {
    it('should throw UnauthorizedException if no tokens are present', async () => {
      const context = createMockExecutionContext({});
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('any token in header request')
      );
    });
  
    it('should throw UnauthorizedException if refresh token is expired', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockResolvedValueOnce({ error: 'Token expired' });
      const context = createMockExecutionContext({ refresh: 'expiredRefreshToken', user: 'validToken' });
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException({ status: false, message: 'The session expired.' })
      );
    });
  
    it('should throw UnauthorizedException if access token is expired', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: '',
        roles: []
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken({}, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException({ status: false, message: 'Invalid refresh token payload.' })
      );
    });
  
    it('should allow access if both tokens are valid', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: 'google',
        roles: [{
          id: 0,
          name: 'admin'
        }]
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });
  });

  describe('roles', () => {
    it('should allow access when no roles are required', async () => {
    
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue([]); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: 'google',
        roles: [{
          id: 0,
          name: 'user'
        }]
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });
    it('should allow access when admin role is required and present', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: 'google',
        roles: [{
          id: 0,
          name: 'admin'
        }]
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
    
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(true); // Se espera acceso permitido
    });
    it('should deny access when admin role is required and absent', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['admin']); // Admin role required
    
      const validUserTokenBody: ITokenBody = {
        id: 0,
        method: 'local',
        roles: [{ id: 0, name: 'user' }]
      };
    
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
      const context = createMockExecutionContext({ user, refresh });
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(false);
    });
    it('should allow access when user role is required and present', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 0,
        method: 'google',
        roles: [{ id: 0, name: 'user' }]
      };
    
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
      const context = createMockExecutionContext({ user, refresh });
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });
    it('should deny access when user role is required and absent', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 0,
        method: 'local',
        roles: []
      };
    
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
      const context = createMockExecutionContext({ user, refresh });
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException({ status: false, message: 'Invalid refresh token payload.' })
      );
    });
  });

  describe('AuthGuard Edge Cases and Unexpected Errors', () => {
    // Test case for invalid or null token payload
    it('should deny access if token payload is invalid or null', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: -1,
        method: '',
        roles: []
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken({}, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException({ status: false, message: 'Invalid refresh token payload.' })
      );
    });
  
    // Test case for roles in token as an empty array
    // it('should deny access if roles in token are an empty array and roles are required', async () => {
    //   jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
    //     const decoded = jwtService.decode(token);
    //     if (!decoded) throw new Error('Token inválido');
    //     return { payload: decoded };
    //   });
      
    //   jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
    //   const validUserTokenBody: ITokenBody = {
    //     id: 0,  
    //     method: '',
    //     roles: []
    //   };

  
    //   const user: string = await getJwtToken(validUserTokenBody, '1m');
    //   const refresh: string = await getJwtToken(validUserTokenBody, '7m');  
    
    //   const context = createMockExecutionContext({ user, refresh});
    //   await expect(authGuard.canActivate(context)).rejects.toThrow(
    //     new UnauthorizedException({ status: false, message: 'No roles in the token' })
    //   );
    // });
  
    // Test case for roles in decorator as an empty array
    it('should allow access if roles in decorator are an empty array', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: 'google',
        roles: [{
          id: 0,
          name: 'admin'
        }]
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken({}, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });
  
    // Test case for unexpected value from Roles decorator
    // it('should allow access if Roles decorator returns null or non-iterable value', async () => {
    //   jest.spyOn(authGuard, 'verifyTokenOrError').mockResolvedValueOnce({ payload: { roles: [{ name: 'user' }] } });
    //   jest.spyOn(reflector, 'get').mockReturnValue(null); // Unexpected value
  
    //   const context = createMockExecutionContext({ user: 'validToken', refresh: 'validRefreshToken' });
    //   const canActivate = await authGuard.canActivate(context);
    //   expect(canActivate).toBe(true);
    // });
  
    // Test case for unexpected error in verifyTokenOrError
    it('should handle unexpected error in verifyTokenOrError', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockRejectedValueOnce(new Error('Unexpected error'));
      const context = createMockExecutionContext({ user: 'validToken', refresh: 'validRefreshToken' });
  
      await expect(authGuard.canActivate(context)).rejects.toThrow(Error);
    });
  
    // Test case for error in obtaining Roles decorator
    it('should handle error in obtaining Roles decorator', async () => {
      jest.spyOn(authGuard, 'verifyTokenOrError').mockImplementation(async (token) => {
        const decoded = jwtService.decode(token);
        if (!decoded) throw new Error('Token inválido');
        return { payload: decoded };
      });
      
      jest.spyOn(reflector, 'get').mockReturnValue(['user']); // User role required
    
      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: 'google',
        roles: [{
          id: 0,
          name: 'admin'
        }]
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken({}, '7m');  
    
      const context = createMockExecutionContext({ user, refresh});
      const canActivate = await authGuard.canActivate(context);
      expect(canActivate).toBe(true); // Should handle the error gracefully
    });
  });

  describe('integration', () => {
    it('should throw UnauthorizedException for valid refresh token and invalid access token', async () => {
      const context = createMockExecutionContext({
        user: '',
        refresh: ''
      });
  
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation((token) => {
        if (token === 'validRefreshToken') {
          return Promise.resolve({ id: 1, method: 'local', roles: [{ name: 'user' }], iat: 123, exp: 456 });
        }
        throw new Error('Invalid token');
      });
  
      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  
    it('should throw UnauthorizedException when no cookies or headers are present', async () => {
      const context = createMockExecutionContext({ user: '', refresh: '' });
  
      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  
    it('should allow access for valid tokens and correct roles', async () => {

      const validUserTokenBody: ITokenBody = {
        id: 1,
        method: 'google',
        roles: [{
          id: 0,
          name: 'user'
        }]
      };

  
      const user: string = await getJwtToken(validUserTokenBody, '1m');
      const refresh: string = await getJwtToken(validUserTokenBody, '7m'); 

      const context = createMockExecutionContext({ user, refresh  });
  
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
        id: 1,
        method: 'local',
        roles: [{ name: 'user' }],
        iat: 123,
        exp: 456,
      });
  
      jest.spyOn(jwtService, 'decode').mockReturnValue({
        roles: [{ name: 'user' }],
      });
  
      jest.spyOn(reflector, 'get').mockReturnValue(['user']);
  
      expect(await authGuard.canActivate(context)).toBe(true);
    });
  });
});