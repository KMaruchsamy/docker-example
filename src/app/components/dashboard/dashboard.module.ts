import { MaterialModule } from './../../material.module';
import { ContentModule } from './../content/content.module';
// import { SubheaderModule } from './../subheader/subheader.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { PipesModule } from './../../pipes/pipes.module';
// import { HeaderModule } from '../header/header.module';
import { PageModule } from './../shared/page.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    PipesModule,
    // HeaderModule,
    // SubheaderModule,
    ContentModule,
    MaterialModule,
    PageModule
  ],
})
export class DashboardModule {}
