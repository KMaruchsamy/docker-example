import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'unhandled-exception',
  template: `<page-header [hideDropdown]="true"></page-header>
    <main role="main" class="app-main">
      <div class="section">
        <div class="container-narrow center">
          <i class="icon broken-heart-icon"></i>
          <h2 class="margin-1em-top">
            We're sorry. Something went wrong on our end.
          </h2>
          <p class="text-larger">
            There was a problem loading this page. We're working to fix the
            problem as soon as possible. We apologize for the inconvenience and
            thank you for your patience!
          </p>
          <div class="section section-beige container-dull-yellow-border container-dull-yellow-top text-larger">
            If you were in the process of <b>modifying a testing session</b>, please
            use the back button in your browser to return to the process. If you
            continue to have issues, please reach out to your customer
            engagement team member.
          </div>
          <h2 class="margin-2em-top">What can you do?</h2>
          <p class="text-larger">Try reloading the page in a few minutes.</p>
          <p class="text-larger">
            Already signed in? Go to the
            <a [routerLink]="['/home']">home page</a>.
          </p>
          <p class="text-larger">
            Need to sign in? Go to the <a [routerLink]="['/']">sign in page</a>.
          </p>
        </div>
      </div>
    </main>`
})
export class UnhandledExceptionComponent implements OnInit {
  constructor(public titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Error - Kaplan Nursing');
  }
}
