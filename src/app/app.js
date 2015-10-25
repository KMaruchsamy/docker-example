import {View, Component,bootstrap,bind} from 'angular2/angular2';
import {Router, RouterOutlet,RouteConfig,RouterLink,ROUTER_PROVIDERS,LocationStrategy,HashLocationStrategy,Location,RouteParams} from 'angular2/router';
import {http, HTTP_PROVIDERS} from 'angular2/http';
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
    {path:'/', redirectTo:'/home'},
    {path:'/home', component:Home, as : 'Home'},
    {path:'/login', component:Login, as : 'Login'},
    {path:'/reset-password/:id/:expirytime', component:ResetPassword, as : 'ResetPassword'},
    {path:'/forgot-password', component:ForgotPassword, as : 'ForgotPassword'},
    {path:'/forgot-password-confirmation', component:ForgotPasswordConfirmation, as : 'ForgotPasswordConfirmation'},
    {path:'/help', component:Help, as : 'Help'},
    {path:'/set-password-first-time', component:SetPasswordFirstTime, as : 'SetPasswordFirstTime'},
    {path:'/account', component:Account, as : 'Account'}
])
export class App {
    constructor(auth: Auth) {
       this.auth = auth;    
    }
    
    onInit(){
    }
  
}

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);