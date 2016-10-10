import {ExceptionHandler, Injectable, Injector} from '@angular/core';
import {Http} from '@angular/http';
import {Router} from '@angular/router';
// import {LogService} from '../services/log.service.service';
// import {AuthService} from '../services/auth';
// import {CommonService} from '../services/common';
import { AuthService } from './../services/auth.service';
import { CommonService } from './../services/common.service';
import { LogService } from './../services/log.service';

@Injectable()
export class MyExceptionHandler implements ExceptionHandler {
    constructor(public injector: Injector) {
        // console.log(this.router);
    }

    call(error, stackTrace = null, reason = null) {
        console.log(stackTrace);
        let http: Http = this.injector.get(Http);
        let auth: AuthService = new AuthService(http);
        auth.refresh();
        let common: CommonService = new CommonService();
        let log = new LogService(auth, http, common);
        log.error(error, stackTrace, reason);
        let router: Router = this.injector.get(Router);


        router.navigate(['/error']);
    }
}