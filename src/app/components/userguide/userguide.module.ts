import { NgModule } from '@angular/core';

import { UserGuideComponent }   from './userguide.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageModule } from './../shared/page.module';
import { TermsOfUseModule } from './../terms-of-use/terms-of-use.module';
import { UserguideRoutingModule } from './usergruide.routing.module';

@NgModule({
    imports: [
        CommonModule,
        PageModule,
        TermsOfUseModule,
        UserguideRoutingModule
    ],
    declarations: [
        UserGuideComponent
    ]
})
export class UserGuideModule { }
