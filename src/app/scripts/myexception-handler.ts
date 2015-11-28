import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {Logger} from './logger';
export class MyExceptionHandler extends ExceptionHandler {
      constructor() {
            super(new Logger(), true);
      }
      call(error, stackTrace = null, reason = null) {
            // do something with the exception
            alert('custom exception triggered');
      }
}