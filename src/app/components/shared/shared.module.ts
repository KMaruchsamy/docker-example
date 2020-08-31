import { DirectivesModule } from './../../directives/directives.module';
import { GatrackDirective } from './../../directives/gatrack.directive';
import { NgModule } from '@angular/core';
import { AlertPopupComponent } from './alert.popup.component';
import { ChooseInstitutionComponent } from './choose-institution.component';
import { ConfirmationPopupComponent } from './confirmation.popup.component';
import { LoaderComponent } from './loader.component';
import { PageModule } from './page.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PasswordHeaderComponent } from './password-header.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        PageModule,
        DirectivesModule
    ],
    exports: [
        AlertPopupComponent,
        ChooseInstitutionComponent,
        ConfirmationPopupComponent,
        LoaderComponent,
        PasswordHeaderComponent,
    ],
    declarations: [
        AlertPopupComponent,
        ChooseInstitutionComponent,
        ConfirmationPopupComponent,
        LoaderComponent,
        PasswordHeaderComponent,
    ],
    providers: [],
})
export class SharedModule { }
