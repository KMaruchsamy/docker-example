import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router-deprecated';
import {Title} from '@angular/platform-browser';
import {PageHeader} from '../shared/page-header';
@Component({
    selector: 'unhandled-exception',
    directives: [RouterLink, PageHeader],
    template: `<page-header [hideDropdown]=true></page-header>
    <main role="main" class="app-main">
      <div class="section">
        <div class="container-narrow center">
          <i class="icon broken-heart-icon"></i>
          <h2 class="margin-1em-top">We’re sorry. Something went wrong on our end.</h2>
          <p class="text-larger">There was a problem loading this page.
            We’re working to fix the problem as soon as possible.
            We apologize for the inconvenience and thank you for your patience!
          </p>
          <h2 class="margin-2em-top">What can you do?</h2>
          <p class="text-larger">Try reloading the page in a few minutes.</p>
          <p class="text-larger">Already signed in? Go to the <a [routerLink]="['/Home']">home page</a>.</p>
          <p class="text-larger">Need to sign in? Go to the <a [routerLink]="['/Login']">sign in page</a>.</p>
       </div>
    </div>
    </main>`
})
export class UnhandledException implements OnInit {
    constructor(public titleService: Title){
    }

    ngOnInit(): void {
        this.titleService.setTitle('Error – Kaplan Nursing');
    } 
}
