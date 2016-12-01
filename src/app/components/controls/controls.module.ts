import { NgModule } from '@angular/core';

import { DropdownMenuComponent } from './dropdown-menu.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    exports: [
        DropdownMenuComponent
    ],
    declarations: [
        DropdownMenuComponent
    ]
})
export class ControlsModule { }
