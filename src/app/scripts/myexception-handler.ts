import { Injectable, Injector, ErrorHandler} from '@angular/core';
import {Http} from '@angular/http';
import {Router} from '@angular/router';
// import {LogService} from '../services/log.service.service';
// import {AuthService} from '../services/auth';
// import {CommonService} from '../services/common';
import { AuthService } from './../services/auth.service';
import { CommonService } from './../services/common.service';
import { LogService } from './../services/log.service';

@Injectable()
export class MyExceptionHandler implements ErrorHandler {
    constructor(public injector: Injector, private log:LogService) {
        // console.log(this.router);
    }

    handleError(error) {
        console.error(error);       
        this.log.error(error);
        let router: Router = this.injector.get(Router);
        router.navigate(['/error']);
    }
}