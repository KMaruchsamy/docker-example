import {Pipe, PipeTransform} from 'angular2/core';
import * as _ from '../lib/index';

@Pipe({
    name: "sort"
})
export class SortPipe implements PipeTransform {
    transform(array: any[], args: any[]): any[] {

        let order = args[0];
        let strProperty = args[1];
        if (!array)
            return [];

        if (array.length === 1)
            return array;

        return array.sort(
            function (a, b) {
                if (a[strProperty].toLowerCase() < b[strProperty].toLowerCase()) return (order === 'asc' ? -1 : 1);
                if (a[strProperty].toLowerCase() > b[strProperty].toLowerCase()) return (order === 'asc' ? 1 : -1);
                return 0;
            }
        );
    }
}