import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({
    name: "parseDate"
})
export class ParseDatePipe implements PipeTransform {
    transform(value: any, args: string[]): string {
        if (!value)
            return null;

        switch (args[0]) {
            case 'ddd':
                return moment(value).format('ddd');
                break;

            case 'MM/dd/yy':
                return moment(value).format('MM/DD/YY');
                break;

            case 'hh:mm a':
                return moment(value).format('h:mma');
                break;

            default:
                break;
        }


    }
}