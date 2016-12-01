import { NgModule } from '@angular/core';

import { TermsOfUseComponent } from './terms-of-use.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    exports: [TermsOfUseComponent],
    declarations: [TermsOfUseComponent]
})
export class TermsOfUseModule { }
