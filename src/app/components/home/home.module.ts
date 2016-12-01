import { NgModule } from '@angular/core';

import { HomeComponent }   from './home.component';
import { PageModule } from './../shared/page.module';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileDescriptionComponent } from './profile-description.component';
import { Ng2PageScrollModule } from 'ng2-page-scroll/ng2-page-scroll';
// import { Angulartics2On } from 'angulartics2';
import { HttpModule } from '@angular/http';
import { HomeRoutingModule } from './home.routing.module';
import { ProfileService } from './profile.service';


@NgModule({
    imports: [
        CommonModule,
        PageModule,
        Ng2PageScrollModule,
        HttpModule,
        HomeRoutingModule
    ],
    declarations: [
        HomeComponent,
        ProfileComponent,
        ProfileDescriptionComponent
    ],
    providers: [
        ProfileService
    ]
})
export class HomeModule { }
