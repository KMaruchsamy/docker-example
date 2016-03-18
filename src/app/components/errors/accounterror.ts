import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
@Component({
    selector: 'accounterror',
    directives: [RouterLink, PageHeader],
    template: `<page-header [hideDropdown]=true></page-header>   
    <header class="inner-banner" role="banner">
      <div class="container">
        <div class="branding-center">
          <h1 class="center">
            <!--Link should be removed or disabled-->
            <a href="javascript:void(0)" tabindex="-1">
              <img class="branding-logo-white" src="images/logo-white_2x.png" alt="Kalplan Nursing">
              <span class="screen-reader-only">Kaplan Nursing Faculty Home Page</span>
            </a>
          </h1>
        </div>
      </div>
    </header>

    <main role="main" class="app-main">
      <div class="section">
        <div class="container-narrow center">
          <i class="icon account-alert-icon"></i>
          <h2 class="margin-1em-top">We’re sorry!<br> There is a problem with your account information.</h2>
          <p class="text-larger">Please call our customer support hotline at <a href="tel:+1-877-572-8457" class="link-base-color">1-866-920-6311</a> (+1-213-452-5783 outside the U.S. and Canada) and
            we’ll get it resolved for you right away.
          </p>
          <p class="text-larger">We’re available from 8:00am to 8:00pm Monday through Friday and from 9:00am to 5:45pm on Saturdays. All times are Eastern.</p>
          <p class="text-larger">Thank you!</p>
       </div>
      </div>
    </main>`
})
export class AccountError {

}