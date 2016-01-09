import {ExceptionHandler} from 'angular2/core';
import {Logger} from './logger';
export class MyExceptionHandler extends ExceptionHandler {
      constructor() {
            super(new Logger(), true);
      }
      call(error, stackTrace = null, reason = null) {
            // do something with the exception
            console.log('custom exception triggered');
      }
}