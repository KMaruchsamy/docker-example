import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/login/logout.component';
import { ChooseInstitutionComponent } from './components/shared/choose-institution.component';

const appRoutes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'faculty', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'choose-institution/:frompage/:redirectpage/:idRN/:idPN', component: ChooseInstitutionComponent },
    { path: 'choose-institution/:frompage/:redirectpage', component: ChooseInstitutionComponent }
    // { path: 'home', loadChildren: 'app/components/home/home.module#HomeModule' },
    // { path: 'help', loadChildren: 'app/components/help/help.module#HelpModule' },
    // { path: 'account', loadChildren: 'app/components/account/account.module#AccountModule' },
    // { path: 'rosters', loadChildren: 'app/components/rosters/rosters.module#RostersModule' },
    // { path: 'reports', loadChildren: 'app/components/reports/reports.module#ReportsModule' },
    // { path: 'groups', loadChildren: 'app/components/groups/groups.module#GroupsModule' },
    // { path: 'forgot-password', loadChildren: 'app/components/forgot-password/forgot-password.module#ForgotPasswordModule' },
    // { path: 'reset-password', loadChildren: 'app/components/reset-password/reset-password.module#ResetPasswordModule' },
    // { path: 'tests', loadChildren: 'app/components/tests/tests.module#TestsModule' },
    // { path: 'userguide', loadChildren: 'app/components/userguide/userguide.module#UserGuideModule' }
];



@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
