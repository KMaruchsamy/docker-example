import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HelpComponent } from './help.component';

const helpRoutes: Routes = [
   { path: 'help', component: HelpComponent, pathMatch:'full' }
]


@NgModule({
    imports: [
        RouterModule.forChild(helpRoutes)
    ],
    exports: [RouterModule]
})
export class HelpRoutingModule { }
