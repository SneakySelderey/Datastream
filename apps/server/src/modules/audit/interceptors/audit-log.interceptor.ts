import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';

interface AuditActionMeta {
  value: string;
  entityType: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const action = this.reflector.get<AuditActionMeta>(
      'auditAction',
      context.getHandler(),
    );

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id ?? 'anonymous';
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (result) => {
        const moduleRef = context.getClass().name;
        const method = context.getHandler().name;
        const entityId = this.extractEntityId(context);

        await this.auditService.log({
          userId,
          action: action.value,
          entityType: action.entityType,
          entityId,
          ip,
          userAgent,
          metadata: { method, module: moduleRef },
        });
      }),
      catchError((error) => {
        const statusCode = error.getStatus?.();
        if (statusCode === 401 || statusCode === 403) {
          const moduleRef = context.getClass().name;
          const method = context.getHandler().name;
          const entityId = this.extractEntityId(context);

          return throwError(() => error).pipe(
            tap(() => {
              this.auditService.log({
                userId,
                action: 'DENIED',
                entityType: action.entityType,
                entityId,
                ip,
                userAgent,
                metadata: { method, module: moduleRef, statusCode },
              });
            }),
          );
        }
        return throwError(() => error);
      }),
    );
  }

  private extractEntityId(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    const paramId = request.params?.id;
    if (paramId) return paramId;

    const body = request.body;
    if (body && body.id) return body.id;

    return undefined;
  }
}