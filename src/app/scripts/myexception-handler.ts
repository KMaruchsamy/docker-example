import {ExceptionHandler} from 'angular2/core';
import {Logger} from './logger';

export class MyExceptionHandler implements ExceptionHandler {
    constructor() {         
     }
      call(error, stackTrace = null, reason = null) {
            // do something with the exception
          console.log("ERROR >> " + error);
          console.log("STACKTRACE >> " + stackTrace);
          console.log("REASON >> " + reason);
          
      }
}