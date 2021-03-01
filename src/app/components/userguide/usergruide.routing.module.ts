import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { UserGuideComponent } from './userguide.component';

const userguideRoutes: Routes = [
    { path: 'userguide', component: UserGuideComponent, canActivate: [AuthorizeGuard] }
]

import { NgModule } from '@angular/core';
import { AuthorizeGuard } from './../../guards/AuthorizeGuard.service';

@NgModule({
    imports: [
        RouterModule.forChild(userguideRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class UserguideRoutingModule { }
