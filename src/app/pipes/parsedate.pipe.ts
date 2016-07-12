import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: "parseDate"
})
export class ParseDatePipe implements PipeTransform {
   transform(value: any, dateFormat: string): string {
        if (!value)
            return null;
        return moment(value).format(dateFormat);
    }
}