import {Component, provide, enableProdMode, ComponentRef, ApplicationRef, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, RouterOutlet, RouterLink, ROUTER_DIRECTIVES, NavigationEnd} from '@angular/router';
import {Angulartics2} from 'angulartics2';
import {Angulartics2GoogleAnalytics} from 'angulartics2/src/providers/angulartics2-google-analytics';
import {Subscription} from 'rxjs/Rx';
declare let ga: Function;
@Component({
    selector: 'app',
    template: `<router-outlet></router-outlet>`,
    providers: [Angulartics2GoogleAnalytics],
    directives: [ROUTER_DIRECTIVES, RouterOutlet, RouterLink]
})

export class AppComponent implements OnInit, OnDestroy {
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

