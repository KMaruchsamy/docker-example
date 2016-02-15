import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
    name: "parseDate"
})
export class ParseDatePipe implements PipeTransform {
    transform(value: any, args: string[]): string {
        if (!value)
            return null;
        return moment(value).format(args[0]);
    }
}