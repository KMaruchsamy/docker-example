import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { GroupsComponent } from './groups.component';

const groupsRoutes: Routes = [
   { path: 'groups', component: GroupsComponent, pathMatch:'full' }
]


@NgModule({
    imports: [
        RouterModule.forChild(groupsRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class GroupsRoutingModule { }
