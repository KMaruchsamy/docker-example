import {ExceptionHandler, Injectable, Injector} from '@angular/core';
import {Http} from '@angular/http';
import {Router} from '@angular/router';
import {Log} from '../services/log';
import {Auth} from '../services/auth';
import {Common} from '../services/common';

@Injectable()
export class MyExceptionHandler implements ExceptionHandler {
    constructor(public injector: Injector) {
        // console.log(this.router);
    }

    call(error, stackTrace = null, reason = null) {
        console.log(stackTrace);
        let http: Http = this.injector.get(Http);
        let auth: Auth = new Auth(http);
        auth.refresh();
        let common: Common = new Common();
        let log = new Log(auth, http, common);
        log.error(error, stackTrace, reason);
        let router: Router = this.injector.get(Router);


        router.navigate(['/error']);
    }
}