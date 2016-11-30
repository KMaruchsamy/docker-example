import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: "removewhitespace"
}) 
export class RemoveWhitespacePipe implements PipeTransform{
   transform(value: any):string {
        if (!value)
            return '';
        return value.replace(/\s/g, "");
    }
}