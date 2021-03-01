import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { ProfileDescriptionComponent } from './profile-description.component';
import { AuthorizeGuard } from './../../guards/AuthorizeGuard.service';

const homeRoutes: Routes = [
  { path: 'home1', component: HomeComponent },
  { path: 'home/profiles/:id', component: ProfileDescriptionComponent,canActivate: [AuthorizeGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
