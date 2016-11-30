import { NgModule } from '@angular/core';

import { GroupsComponent }   from './groups.component';
import { PageModule } from './../shared/page.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupsRoutingModule } from './groups.routing.module';

@NgModule({
    imports: [
        PageModule,
        CommonModule,
        GroupsRoutingModule
    ],
    declarations: [
        GroupsComponent
    ]
})
export class GroupsModule { }
