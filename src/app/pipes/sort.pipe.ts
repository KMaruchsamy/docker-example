import {Pipe, PipeTransform} from '@angular/core';
// import * as _ from 'lodash';

@Pipe({
    name: "sort"
})
export class SortPipe implements PipeTransform {
    transform(array: any[], order:string, strProperty:string): any[] {

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