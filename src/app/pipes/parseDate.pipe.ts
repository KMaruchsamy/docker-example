import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
    name: "parseDate"
})
export class ParseDatePipe implements PipeTransform {
    transform(value: any): string {
        if (!value)
            return '';
        return Date.parse(value);
    }
}