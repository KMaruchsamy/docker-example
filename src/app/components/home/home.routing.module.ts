import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { HomeComponent } from './home.component';
import { ProfileDescriptionComponent } from './profile-description.component';

const homeRoutes: Routes = [
  { path: 'home1', component: HomeComponent },
  { path: 'home/profiles/:id', component: ProfileDescriptionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
