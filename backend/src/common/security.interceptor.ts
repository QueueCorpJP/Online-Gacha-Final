import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecurityLogService } from '../modules/security/security-log.service';
import { SecurityEventType } from '../modules/security/security-log.entity';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private securityLogService: SecurityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        const request = context.switchToHttp().getRequest();
        const ip = this.securityLogService.getClientIp(request);
        
        if (error instanceof UnauthorizedException) {
          this.securityLogService.logSecurityEvent(
            SecurityEventType.UNAUTHORIZED_ACCESS,
            ip,
            `Unauthorized access attempt to ${request.method} ${request.url}`,
            request.user?.id
          );
        }
        
        return throwError(() => error);
      }),
    );
  }
}