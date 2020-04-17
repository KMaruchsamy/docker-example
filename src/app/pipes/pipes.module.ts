import { NgModule } from '@angular/core';
import { ParseDatePipe } from './parsedate.pipe';
import { RemoveWhitespacePipe } from './removewhitespace.pipe';
import { RoundPipe } from './round.pipe';
import { SortPipe } from './sort.pipe';
import { SafePipe } from './safe.pipe';


@NgModule({
    exports: [
        ParseDatePipe,
        RemoveWhitespacePipe,
        RoundPipe,
        SortPipe,
        SafePipe
    ],
    declarations: [
        ParseDatePipe,
        RemoveWhitespacePipe,
        RoundPipe,
        SortPipe,
        SafePipe
    ]
})
export class PipesModule { }
