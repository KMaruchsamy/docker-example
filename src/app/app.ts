import {Component, provide, enableProdMode, ComponentRef, ApplicationRef, OnInit, OnDestroy} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {Title} from '@angular/platform-browser';
import {Router, RouterOutlet, RouterLink, ROUTER_DIRECTIVES, NavigationEnd} from '@angular/router';
import {HTTP_PROVIDERS, Http} from '@angular/http';
import {Home} from './components/home/home';
import {Login} from './components/login/login';
import {Auth} from './services/auth';
import {ResetPassword} from './components/password/reset-password';
import {ForgotPassword} from './components/password/forgot-password';
import {ForgotPasswordConfirmation} from './components/password/forgot-password-confirmation';
import {ResetPasswordExpired} from './components/password/reset-password-expired';
import {Help} from './components/help/help';
import {UserGuide} from './components/userguide/userguide';
import {SetPasswordFirstTime} from './components/password/set-password-first-time';
import {Account} from './components/account/account';
import {Page} from './scripts/page';
import {ChooseInstitution} from './components/shared/choose-institution';
import {ProfileDescription} from './components/home/profile-description';
import {ExceptionHandler} from '@angular/core';
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
import {Logout} from './components/shared/logout';
import {AccountError} from './components/errors/accounterror';
import {LastTestingSession} from './components/tests/last-testing-session';
import {Log} from './services/log';
import {Angulartics2} from 'angulartics2';
import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';
import {ConfirmationModifyInProgress} from './components/tests/confirmation-modify-in-progress';
import {Subscription} from 'rxjs/Rx';
declare let ga: Function;
@Component({
    selector: 'app',
    template: `<router-outlet></router-outlet>`,
    providers: [Angulartics2GoogleAnalytics, Log, Auth],
    directives: [ROUTER_DIRECTIVES, RouterOutlet, RouterLink]
})

export class App implements OnInit, OnDestroy {
    browserSubscription: Subscription;
    constructor(public router: Router, private applicationRef: ApplicationRef, public angulartics2: Angulartics2, public angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, public titleService: Title) {
        this.browserSubscription = router.events.subscribe((uri) => {
            if (uri instanceof NavigationEnd) {
                ga('send', 'pageview', uri.urlAfterRedirects);
            }
            if ((Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) || false || !!document.documentMode) // IE
            {
                applicationRef.zone.run(() => applicationRef.tick());
            }
        });
    }
    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }

    ngOnInit(): void {
        this.setTitle('Kaplan Nursing');
    }

    ngOnDestroy(): void {
        if (this.browserSubscription)
            this.browserSubscription.unsubscribe();
    }
}

