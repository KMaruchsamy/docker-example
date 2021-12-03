import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { CommonService } from './common.service';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class HttpHeaderInterceptorService implements HttpInterceptor {
  private authToken: string;
  private server: string;
  constructor(private auth: AuthService, private common: CommonService) {
    this.authToken = this.auth.token;
    this.server = this.common.getApiServer();
  }
  intercept(req: HttpRequest<any>, next: HttpHandler) {

    if (this.authToken) {
        req.headers.append('Cache-Control', ' no-cache');
        req.headers.append('Pragma', 'no-cache');
        req.headers.append('Expires', '-1');
        req.headers.append('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
        req.headers.append('x-content-type-options', 'nosniff');
        req.headers.append('Content-Security-Policy', 'default-src self ' + this.server);      
    } else {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        }
      });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
      })
    );
  }
}
