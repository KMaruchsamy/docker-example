import { NgModule } from '@angular/core';
import { ParseDatePipe } from './parsedate.pipe';
import { RemoveWhitespacePipe } from './removewhitespace.pipe';
import { RoundPipe } from './round.pipe';
import { SortPipe } from './sort.pipe';


@NgModule({
    exports: [
        ParseDatePipe,
        RemoveWhitespacePipe,
        RoundPipe,
        SortPipe
    ],
    declarations: [
        ParseDatePipe,
        RemoveWhitespacePipe,
        RoundPipe,
        SortPipe
    ]
})
export class PipesModule { }
