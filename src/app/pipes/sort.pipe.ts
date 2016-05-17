import {Pipe, PipeTransform} from 'angular2/core';
import * as _ from '../lib/index';

@Pipe({
    name: "sort"
})
export class SortPipe implements PipeTransform {
    transform(array: any[], args: any[]): any[] {
        
        console.log(array);
        console.log(args);
        
        if (!array)
            return [];

        if (array.length === 1)
            return array;

        return _.sortByOrder(array, args[1], args[0]);
    }
}