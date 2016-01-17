import {Component, provide, enableProdMode} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {RouterOutlet, RouteConfig, RouterLink, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
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


@Component({
    selector: 'app',
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES, RouterOutlet, RouterLink]
})

@RouteConfig([
    { path: '/', component: Login, as: 'Login' },
    { path: '/home', component: Home, as: 'Home' },
    { path: '/reset-password/:id/:expirytime', component: ResetPassword, as: 'ResetPassword' },
    { path: '/forgot-password', component: ForgotPassword, as: 'ForgotPassword' },
    { path: '/forgot-password-confirmation', component: ForgotPasswordConfirmation, as: 'ForgotPasswordConfirmation' },
    { path: '/help', component: Help, as: 'Help' },
    { path: '/userguide', component: UserGuide, as: 'UserGuide' },
    { path: '/set-password-first-time', component: SetPasswordFirstTime, as: 'SetPasswordFirstTime' },
    { path: '/account', component: Account, as: 'Account' },
    { path: '/choose-institution/:frompage/:redirectpage/:idRN/:idPN', component: ChooseInstitution, as: 'ChooseInstitution' },
    { path: '/profiles/:id', component: ProfileDescription, as: 'Profiles' },
    { path: '/tests/choose-test/:institutionId', component: ChooseTest, as: 'ChooseTest' },
    { path: '/tests/schedule-test', component: ScheduleTest, as: 'ScheduleTest' }
])
export class App {
    constructor() {
    }
}

// enableProdMode();

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(ExceptionHandler, { useClass: MyExceptionHandler }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
]);