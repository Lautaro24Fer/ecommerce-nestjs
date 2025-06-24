import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class PaymentGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const ctxHttp = context.switchToHttp();
    const request = ctxHttp.getRequest();

    const token = this.getTokenFromCookies(request, 'openpay_token');

    if(!token){
      throw new UnauthorizedException({ error: 'No token in request cookies' })
    }

    return true;
  }

  getTokenFromCookies(request: Request, alias: string){
    const token = request.cookies[alias];
    return token;
  }
}
