import {ExceptionHandler, Injectable, Injector} from 'angular2/core';
import {Router} from 'angular2/router';

@Injectable()
export class MyExceptionHandler implements ExceptionHandler{
    constructor(public injector:Injector) {
        // console.log(this.router);
    }
    call(error, stackTrace = null, reason = null) {
        console.log("ERROR >> " + error);
        console.log("STACKTRACE >> " + stackTrace);
        console.log("REASON >> " + reason);
        let router:Router = this.injector.get(Router);
        router.navigate(['/UnhandledException']);
    }
}