import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { UserGuideComponent } from './userguide.component';

const userguideRoutes: Routes = [
    { path: 'userguide', component: UserGuideComponent }
]

import { NgModule } from '@angular/core';

@NgModule({
    imports: [
        RouterModule.forChild(userguideRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class UserguideRoutingModule { }
