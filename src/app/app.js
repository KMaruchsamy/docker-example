import {View, Component,bootstrap} from 'angular2/angular2';
import {Router, RouterOutlet,RouteConfig,RouterLink,ROUTER_BINDINGS,LocationStrategy,HashLocationStrategy,Location,RouteParams} from 'angular2/router';
import {http, HTTP_BINDINGS} from 'angular2/http';
import { bind } from 'angular2/di';
import {Home} from '../components/home/home';
import {Login} from '../components/login/login';
import {Auth} from '../services/auth';
import {ResetPassword} from '../components/password/reset-password';
import {ForgotPassword} from '../components/password/forgot-password';
import {ForgotPasswordConfirmation} from '../components/password/forgot-password-confirmation';
import {Help} from '../components/help/help';
import {SetPasswordFirstTime} from '../components/password/set-password-first-time';
import {Account} from '../components/account/account';
import {Page} from '../../scripts/page';
import {Logger} from '../../scripts/logger';
// import {ExceptionHandler} from 'angular2/src/core/exception_handler';
// import {MyExceptionHandler} from '../../scripts/myexception-handler';


@Component({
    selector: 'app',
    viewBindings:[Auth]
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
    {path:'/set-password-first-time', component:SetPasswordFirstTime, as : 'set-password-first-time'},
    {path:'/account', component:Account, as : 'account'}
])
export class App {
    constructor(auth: Auth) {
       this.auth = auth;    
    }
    
    onInit(){
    }
  
}

bootstrap(App, [
    ROUTER_BINDINGS,
    HTTP_BINDINGS,
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);