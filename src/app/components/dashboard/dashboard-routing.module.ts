import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthorizeGuard } from './../../guards/AuthorizeGuard.service';

const dashboardRoutes: Routes = [
  { path: 'home', component: DashboardComponent , canActivate: [AuthorizeGuard]}
]

@NgModule({
  imports: [
    RouterModule.forChild(
        dashboardRoutes
    )
],
exports: [
    RouterModule
]
})
export class DashboardRoutingModule { }
