import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AppLoggerService } from "./logger.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          this.logger.logRequest(method, url, res.statusCode, Date.now() - start, {
            userId: user?.id,
          });
        },
        error: (err) => {
          const status = err.status ?? 500;
          this.logger.logRequest(method, url, status, Date.now() - start, {
            userId: user?.id,
          });
        },
      })
    );
  }
}
