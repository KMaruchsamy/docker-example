import { Injectable, Injector, ErrorHandler} from '@angular/core';
import {Router} from '@angular/router';
import { LogService } from './../services/log.service';

@Injectable()
export class MyExceptionHandler implements ErrorHandler {
    constructor(public injector: Injector) {
        // console.log(this.router);
    }

    handleError(error) {
        console.error(error);       
      //  this.log.error(error);
        let router: Router = this.injector.get(Router);
        router.navigate(['/error']);
    }
}