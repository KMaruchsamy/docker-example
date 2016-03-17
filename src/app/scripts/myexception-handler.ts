import {ExceptionHandler, Injectable, Injector} from 'angular2/core';
import {Http} from 'angular2/http';
import {Router} from 'angular2/router';
import {Log} from '../services/log';
import {Auth} from '../services/auth';
import {Common} from '../services/common';

@Injectable()
export class MyExceptionHandler implements ExceptionHandler {
    constructor(public injector: Injector) {
        // console.log(this.router);
    }

    call(error, stackTrace = null, reason = null) {
        debugger;
        console.log("ERROR >> " + error);
        console.log("STACKTRACE >> " + stackTrace);
        console.log("REASON >> " + reason);

        let http: Http = this.injector.get(Http);
        let auth: Auth = new Auth();
        auth.refresh();
        let common: Common = new Common();
        let log = new Log(auth, http, common);
        log.error(error, stackTrace, reason);
        let router: Router = this.injector.get(Router);


        router.navigate(['/UnhandledException']);
    }
}