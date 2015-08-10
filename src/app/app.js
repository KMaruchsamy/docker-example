import {View, Component,bootstrap} from 'angular2/angular2';
import {Router, RouterOutlet,RouteConfig,RouterLink,routerInjectables,LocationStrategy,HashLocationStrategy,Location,RouteParams} from 'angular2/router';
import { bind } from 'angular2/di';
import {Home} from '../components/home/home';
import {Login} from '../components/login/login';
import {Auth} from '../services/auth';
import {ResetPassword} from '../components/password/reset-password';
import {ForgotPassword} from '../components/password/forgot-password';
import {ForgotPasswordConfirmation} from '../components/password/forgot-password-confirmation';
import {Help} from '../components/help/help';
import {SetPasswordFirstTime} from '../components/password/set-password-first-time';

@Component({
    selector: 'app',
    viewInjector:[Auth]
})
@View({
    template: `<router-outlet></router-outlet>`,
    directives: [RouterOutlet,RouterLink]
})
@RouteConfig([
    {path:'/', component:Home, as : 'home'},
    {path:'/login', component:Login, as : 'login'},
    {path:'/reset-password/:id/:expirytime', component:ResetPassword, as : 'reset-password'},
    {path:'/forgot-password', component:ForgotPassword, as : 'forgot-password'},
    {path:'/forgot-password-confirmation', component:ForgotPasswordConfirmation, as : 'forgot-password-confirmation'},
    {path:'/help', component:Help, as : 'help'},
    {path:'/set-password-first-time', component:SetPasswordFirstTime, as : 'set-password-first-time'}
])

export class App {
    constructor(router : Router, auth : Auth,location:Location) {
        let self = this;
        self.auth = auth;
    }
}

bootstrap(App, [
routerInjectables,
bind(LocationStrategy).toClass(HashLocationStrategy)
]);