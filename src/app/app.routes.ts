import {provideRouter, RouterConfig } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/shared/logout.component';
import { HomeComponent } from './components/home/home.component';
import { ResetPasswordComponent } from './components/password/reset-password.component';
import { ForgotPasswordComponent } from './components/password/forgot-password.component';
import { ForgotPasswordConfirmationComponent } from './components/password/forgot-password-confirmation.component';
import { ResetPasswordExpiredComponent } from './components/password/reset-password-expired.component';
import { HelpComponent } from './components/help/help.component';
import { UserGuideComponent } from './components/userguide/userguide.component';
import { SetPasswordFirstTimeComponent } from './components/password/set-password-first-time.component';
import { AccountComponent } from './components/account/account.component';
import { ChooseInstitutionComponent } from './components/shared/choose-institution.component';
import { ProfileDescriptionComponent } from './components/home/profile-description.component';
import { ReportsComponent } from './components/reports/reports.component';
import { RostersComponent } from './components/rosters/rosters.component';
import { GroupsComponent } from './components/groups/groups.component';
import { ManageTestsComponent } from './components/tests/manage-tests.component';
import { ChooseTestComponent } from './components/tests/choose-test.component';
import { SharedDeactivateGuard } from './guards/shared.deactivate.guard';
import { ScheduleTestComponent } from './components/tests/schedule-test.component';
import { AddStudentsComponent } from './components/tests/add-students.component';
import { ReviewTestComponent } from './components/tests/review-test.component';
import { ConfirmationComponent } from './components/tests/confirmation.component';
import { ViewTestComponent } from './components/tests/view-test.component';
import { LastTestingSessionComponent } from './components/tests/last-testing-session.component';
import { ConfirmationModifyInProgressComponent } from './components/tests/confirmation-modify-in-progress.component';
import { AccountErrorComponent } from './components/errors/accounterror.component';
import { UnhandledExceptionComponent } from './components/errors/unhandledexception.component';
import { PageNotFoundComponent } from './components/errors/pagenotfound.component';
import {RosterChangeNoteComponent} from './components/rosters/roster-change-note.component';

const APP_ROUTES: RouterConfig = [
    { path: '', component: LoginComponent, pathMatch:"full"  },
    { path: 'faculty', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'home', component: HomeComponent },
    { path: 'reset-password/:id/:expirytime', component: ResetPasswordComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'forgot-password-confirmation', component: ForgotPasswordConfirmationComponent },
    { path: 'reset-password-expired', component: ResetPasswordExpiredComponent },
    { path: 'help', component: HelpComponent },
    { path: 'userguide', component: UserGuideComponent },
    { path: 'set-password-first-time/:id', component: SetPasswordFirstTimeComponent },
    { path: 'account', component: AccountComponent },
    { path: 'account/:scroll', component: AccountComponent },
    { path: 'choose-institution/:frompage/:redirectpage/:idRN/:idPN', component: ChooseInstitutionComponent },
    { path: 'choose-institution/:frompage/:redirectpage', component: ChooseInstitutionComponent },
    { path: 'profiles/:id', component: ProfileDescriptionComponent},
    { path: 'reports', component: ReportsComponent },
    { path: 'rosters', component: RostersComponent },
    { path: 'rosters/changes-note', component: RosterChangeNoteComponent },
    { path: 'groups', component: GroupsComponent},
    { path: 'tests', component: ManageTestsComponent, pathMatch:"full" },
    { path: 'tests/choose-test/:institutionId', component: ChooseTestComponent, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/schedule-test', component: ScheduleTestComponent, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/add-students', component: AddStudentsComponent, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/review', component: ReviewTestComponent, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/confirmation', component: ConfirmationComponent },
    { path: 'tests/view/:id', component: ViewTestComponent },
    { path: 'tests/:action/choose-test/:institutionId', component: ChooseTestComponent, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/:action/schedule-test', component: ScheduleTestComponent , canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/:action/add-students', component: AddStudentsComponent , canDeactivate:[SharedDeactivateGuard]},
    { path: 'tests/:action/review', component: ReviewTestComponent, canDeactivate:[SharedDeactivateGuard]},
    { path: 'tests/:action/view/:id', component: ViewTestComponent },
    { path: 'tests/:action/confirmation', component: ConfirmationComponent }, 
    { path: 'testing-session-expired', component: LastTestingSessionComponent },
    { path: 'tests/confirmation-modify-in-progress', component: ConfirmationModifyInProgressComponent },
    { path: 'accounterror', component: AccountErrorComponent },
    { path: 'error', component: UnhandledExceptionComponent },    
    { path: '**', component: PageNotFoundComponent },
]


export const APP_ROUTES_PROVIDER = [
    provideRouter(APP_ROUTES),
    SharedDeactivateGuard
]