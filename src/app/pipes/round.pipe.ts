import {Pipe, PipeTransform} from 'angular2/core';
import * as _ from '../lib/index';

@Pipe({
    name: "round"
}) 
export class RoundPipe implements PipeTransform{
    transform(value: any):string {
        if (!value)
            return '';
        return _.round(value).toString();
    }
}