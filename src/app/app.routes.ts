import {provideRouter, RouterConfig, } from '@angular/router'
import {Home} from './components/home/home';
import {Login} from './components/login/login';
import {ResetPassword} from './components/password/reset-password';
import {ForgotPassword} from './components/password/forgot-password';
import {ForgotPasswordConfirmation} from './components/password/forgot-password-confirmation';
import {ResetPasswordExpired} from './components/password/reset-password-expired';
import {Help} from './components/help/help';
import {UserGuide} from './components/userguide/userguide';
import {SetPasswordFirstTime} from './components/password/set-password-first-time';
import {Account} from './components/account/account';
import {ChooseInstitution} from './components/shared/choose-institution';
import {Profile} from './components/home/profile'
import {ProfileDescription} from './components/home/profile-description';
import {ChooseTest} from './components/tests/choose-test';
import {ScheduleTest} from './components/tests/schedule-test';
import {AddStudents} from './components/tests/add-students';
import {ReviewTest} from './components/tests/review-test';
import {PageNotFound} from './components/errors/pagenotfound';
import {UnhandledException} from './components/errors/unhandledexception';
import {Confirmation} from './components/tests/confirmation';
import {ViewTest} from './components/tests/view-test';
import {ManageTests} from './components/tests/manage-tests';
import {Reports} from './components/reports/reports';
import {Rosters} from './components/rosters/rosters';
import {Groups} from './components/groups/groups';
import {Logout} from './components/shared/logout';
import {AccountError} from './components/errors/accounterror';
import {LastTestingSession} from './components/tests/last-testing-session';
import {SharedDeactivateGuard} from './components/shared/shared.deactivate.guard';

const APP_ROUTES: RouterConfig = [
    { path: '', component: Login },
    { path: 'faculty', component: Login },
    { path: 'logout', component: Logout },
    { path: 'home', component: Home },
    { path: 'reset-password/:id/:expirytime', component: ResetPassword },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'forgot-password-confirmation', component: ForgotPasswordConfirmation },
    { path: 'reset-password-expired', component: ResetPasswordExpired },
    { path: 'help', component: Help },
    { path: 'userguide', component: UserGuide },
    { path: 'set-password-first-time', component: SetPasswordFirstTime },
    { path: 'account', component: Account },
    { path: 'account/:scroll', component: Account },
    { path: 'choose-institution/:frompage/:redirectpage/:idRN/:idPN', component: ChooseInstitution },
    { path: 'profiles/:id', component: ProfileDescription},
    { path: 'reports', component: Reports },
    { path: 'rosters', component: Rosters },
    { path: 'groups', component: Groups},
    { path: 'tests', component: ManageTests, pathMatch:"full" },
    { path: 'tests/choose-test/:institutionId', component: ChooseTest, pathMatch:"full", canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/schedule-test', component: ScheduleTest, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/add-students', component: AddStudents, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/review', component: ReviewTest, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/confirmation', component: Confirmation },
    { path: 'tests/view/:id', component: ViewTest },
    { path: 'tests/:action/choose-test/:institutionId', component: ChooseTest, canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/:action/schedule-test', component: ScheduleTest , canDeactivate:[SharedDeactivateGuard] },
    { path: 'tests/:action/add-students', component: AddStudents , canDeactivate:[SharedDeactivateGuard]},
    { path: 'tests/:action/review', component: ReviewTest, canDeactivate:[SharedDeactivateGuard]},
    { path: 'tests/:action/view/:id', component: ViewTest },
    { path: 'tests/:action/confirmation', component: Confirmation },
    { path: 'error', component: UnhandledException },
    { path: '**', component: PageNotFound },
    { path: 'accounterror', component: AccountError },
    { path: 'testing-session-expired', component: LastTestingSession }
]


export const APP_ROUTES_PROVIDER = [
    provideRouter(APP_ROUTES),
    SharedDeactivateGuard
]