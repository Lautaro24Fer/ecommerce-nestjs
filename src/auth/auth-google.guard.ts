import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
     const request = context.switchToHttp().getRequest();
    const queryParams = request.query;

    // Permitir acceso si el usuario canceló el consentimiento
    if (queryParams.error === 'access_denied') {
      return true;
    }

    // Solo logear y continuar si no se ha negado el acceso
    const activate = (await super.canActivate(context)) as boolean;
    await super.logIn(request);

    return activate;
  }
}
