import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
@Component({
    selector: 'notfound',
    directives:[RouterLink,PageHeader],
    template: `
    <page-header [hideDropdown]=true></page-header>
    <main role="main" class="app-main">
                    <div class="section">
                        <div class="container-medium-width center">
                            <i class="icon question-mark-icon"></i>
                            <h2 class="margin-1em-top">Hmm…we can’t find that page.</h2>
                            <p class="text-larger">The page you were looking for may have been moved or deleted, or it may not exist.</p>
                            <h2 class="margin-2em-top">What can you do?</h2>
                            <p class="text-larger">If you typed something into your browser’s address bar, try again.</p>
                            <p class="text-larger">Already signed in? Go to the <a [routerLink]= "['/Home']">home page</a>.</p>
                            <p class="text-larger">Need to sign in? Go to the <a [routerLink]= "['/Login']">sign in page</a>.</p>
                        </div>
                    </div>
                </main>`
})
export class PageNotFound {

}