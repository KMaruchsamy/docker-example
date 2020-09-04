import { NgModule } from '@angular/core';
import { HomeComponent }   from './home.component';
import { PageModule } from './../shared/page.module';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileDescriptionComponent } from './profile-description.component';
import { Ng2PageScrollModule } from 'ng2-page-scroll/ng2-page-scroll';
import { HttpClientModule } from '@angular/common/http';
import { HomeRoutingModule } from './home.routing.module';
import { ProfileService } from './profile.service';
import { PipesModule } from '../../pipes/pipes.module';
import { DirectivesModule } from './../../directives/directives.module';


@NgModule({
    imports: [
        CommonModule,
        PageModule,
        Ng2PageScrollModule.forRoot(),
        HttpClientModule,
        HomeRoutingModule,
        PipesModule,
        DirectivesModule
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
