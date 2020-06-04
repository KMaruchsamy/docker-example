import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: "round"
}) 
export class RoundPipe implements PipeTransform{
    transform(value: any): string {
        if (!value) {
            if (value === 0)
                return 'Untimed';
             return '';
        }           
        return _.round(value).toString();
    }
}