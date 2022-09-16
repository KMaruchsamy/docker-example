import { DirectivesModule } from './../../directives/directives.module';
import { GatrackDirective } from './../../directives/gatrack.directive';
import { MaterialModule } from './../../material.module';
import { ContentModule } from './../content/content.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { PipesModule } from './../../pipes/pipes.module';
import { PageModule } from './../shared/page.module';
import { SharedModule } from './../shared/shared.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    PipesModule,
    ContentModule,
    MaterialModule,
    PageModule,
    DirectivesModule,
    SharedModule
  ],
})
export class DashboardModule {}
