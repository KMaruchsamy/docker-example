import {Component, provide, enableProdMode, ComponentRef} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {Router, RouterOutlet, RouteConfig, RouterLink, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy, APP_BASE_HREF, ROUTER_PRIMARY_COMPONENT} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';
import {Home} from './components/home/home';
import {Login} from './components/login/login';
import {Auth} from './services/auth';
import {ResetPassword} from './components/password/reset-password';
import {ForgotPassword} from './components/password/forgot-password';
import {ForgotPasswordConfirmation} from './components/password/forgot-password-confirmation';
import {Help} from './components/help/help';
import {UserGuide} from './components/userguide/userguide';
import {SetPasswordFirstTime} from './components/password/set-password-first-time';
import {Account} from './components/account/account';
import {Page} from './scripts/page';
import {Logger} from './scripts/logger';
import {ChooseInstitution} from './components/shared/choose-institution';
import {ProfileDescription} from './components/home/profile-description';
import {ExceptionHandler} from 'angular2/core';
import {MyExceptionHandler} from './scripts/myexception-handler';
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

@Component({
    selector: 'app',
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES, RouterOutlet, RouterLink]
})

@RouteConfig([
    { path: '/', component: Login, name: 'Login' },
    { path: '/home', component: Home, name: 'Home' },
    { path: '/reset-password/:id/:expirytime', component: ResetPassword, name: 'ResetPassword' },
    { path: '/forgot-password', component: ForgotPassword, name: 'ForgotPassword' },
    { path: '/forgot-password-confirmation', component: ForgotPasswordConfirmation, name: 'ForgotPasswordConfirmation' },
    { path: '/help', component: Help, name: 'Help' },
    { path: '/userguide', component: UserGuide, name: 'UserGuide' },
    { path: '/set-password-first-time', component: SetPasswordFirstTime, name: 'SetPasswordFirstTime' },
    { path: '/account', component: Account, name: 'Account' },
    { path: '/account/:scroll', component: Account, name: 'AccountScroll' },
    { path: '/choose-institution/:frompage/:redirectpage/:idRN/:idPN', component: ChooseInstitution, name: 'ChooseInstitution' },
    { path: '/profiles/:id', component: ProfileDescription, name: 'Profiles' },
    { path: '/reports', component: Reports, name: 'Reports' },
    { path: '/rosters', component: Rosters, name: 'Rosters' },
    { path: '/groups', component: Groups, name: 'Groups' },
    { path: '/tests', component: ManageTests, name: 'ManageTests' },
    { path: '/tests/choose-test/:institutionId', component: ChooseTest, name: 'ChooseTest' },
    { path: '/tests/schedule-test', component: ScheduleTest, name: 'ScheduleTest' },
    // { path: '/tests/:action/choose-test/:institutionId/:scheduleId', component: ChooseTest, as: 'ModifyChooseTest' },
    // { path: '/tests/:action/schedule-test', component: ScheduleTest, as: 'ModifyScheduleTest' },
    { path: '/tests/add-students', component: AddStudents, name: 'AddStudents' },
    { path: '/tests/review', component: ReviewTest, name: 'ReviewTest' },
    { path: '/tests/confirmation', component: Confirmation, name: 'Confirmation' },
    { path: '/tests/view', component: ViewTest, name: 'ViewTest' },
    { path: '/error', component: UnhandledException, name: 'UnhandledException' },
    { path: '/*wildcard', component: PageNotFound, name: 'PageNotFound' }
])
export class App {
    constructor(public router: Router) {
    }

}

// enableProdMode();

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(ExceptionHandler, { useClass: MyExceptionHandler }),
    provide(ROUTER_PRIMARY_COMPONENT, { useValue: App }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
]);