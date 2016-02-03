import {ExceptionHandler, Injectable, Inject,Injector} from 'angular2/core';
import {Router} from 'angular2/router';
// import {Logger} from './logger';

@Injectable()
export class MyExceptionHandler implements ExceptionHandler{

    // constructor(public router: Router) { }
    call(error, stackTrace = null, reason = null) {
        // do something with the exception
        console.log("ERROR >> " + error);
        console.log("STACKTRACE >> " + stackTrace);
        console.log("REASON >> " + reason);
        // this.router.navigateByUrl('/error');
        // location.href = '/#/error';
        // let injector: any = Injector.resolveAndCreate([Router]);
        // let router: Router = injector.get(Router);
        // router.navigateByUrl('/error');
        
    }
}