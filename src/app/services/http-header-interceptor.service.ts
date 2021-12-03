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
    console.log('header security');

    if (this.authToken) {
      console.log('if');
      
        if (!req.headers.has('Authorization')) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${this.authToken}`
            }
          });
        }

        if (!(req.method == "OPTIONS"))
        {
          req.headers.append("Access-Control-Allow-Origin", req.headers["Origin"] );
          req.headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
          req.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS" );
          req.headers.append("Access-Control-Allow-Credentials", "true" );

        }

        if (!req.headers.has('Content-Type')) {
          req = req.clone({
            setHeaders: {
              'content-type': 'application/json'
            }
          });
        }

        if (!req.headers.has('Cache-Control')) {
          req = req.clone({
            setHeaders: {
              'Cache-Control': ' no-cache',
              Pragma: 'no-cache',
              Expires: '-1'
            }
          });
        }

        if (!req.headers.has('Strict-Transport-Security')) {
          req = req.clone({
            setHeaders: {
              'Strict-Transport-Security': 'max-age=15552000; includeSubDomains'
            }
          });
        }

        if (!req.headers.has('x-content-type-options')) {
          req = req.clone({
            setHeaders: {
              'x-content-type-options': 'nosniff'
            }
          });
        }
        if (!req.headers.has('Content-Security-Policy')) {
          req = req.clone({
            setHeaders: {
              'Content-Security-Policy': 'default-src self ' + this.server
            }
          });
        }


      
    } else {
      console.log('else');
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json'
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
