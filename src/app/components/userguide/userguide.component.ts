import {Component, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, CanActivate} from '@angular/router';
import {Title} from '@angular/platform-browser';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
import {links} from '../../constants/config';
// import {PageHeader} from '../shared/page-header';
// import {TermsOfUse} from '../terms-of-use/terms-of-use';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';
import {UtilityService} from '../../services/utility.service';
import {Angulartics2On} from 'angulartics2';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { TermsOfUseComponent } from './../terms-of-use/terms-of-use.component';

@Component({
    selector: 'userguide',
    templateUrl: 'components/userguide/userguide.component.html',
    host: {
        '(window:scroll)': 'onScroll($event)'
    },

    providers: [AuthService, UtilityService, CommonService],
    directives: [PageHeaderComponent, ROUTER_DIRECTIVES, Angulartics2On, TermsOfUseComponent],
    pipes: [ParseDatePipe]
})
export class UserGuideComponent implements OnInit {
    activeId: string;
    showTerms: boolean = false;
    termsAccepted: boolean = true;
    constructor(public router: Router, public auth: AuthService, public common: CommonService, public titleService: Title) {
    }

    ngOnInit(): void {
        if (this.auth.isAuth()) {
        this.titleService.setTitle('Faculty User Guide – Kaplan Nursing');
        window.scroll(0,0);
        this.activeId = '#whatsNew';
        this.termsAccepted = true;
        console.log(this.termsAccepted);
        }
        else {
            this.redirectToLogin();
        }
    }
    
     redirectToLogin() {
        this.router.navigate(['/']);
    }
    
    //on click event added to elements in html template
    scroll(element: string, e: any) {
        e.preventDefault();
        let __this = this;
        let offset = 0;
            offset = $('header').outerHeight(true) 
        if (element === '#whatsNew') {  // Includes whats New link and Back to Top link
            offset = $('header').outerHeight(true) + $('.faculty-user-guide-header').outerHeight(true);
            if ($(window).width() < 768 && $(e.target).attr('id') === 'backToTop') {
             offset += $('.faculty-user-guide-menu ul').outerHeight(true) + 10;
            }
            if ($(window).width() < 768 && $(e.target).attr('id') === 'whatsNewLink') {
             offset = $('header').outerHeight(true) 
            }
         } 
         
        if ($(element).is('.h5, .h6')) { //if element is a subelement add 15px margin (may want to refactor and add specific classes)
          offset = offset + 15;
        }
        $('html, body').animate({
            scrollTop: $(element).offset().top - offset
        }, 500, 'swing',function () {
             __this.activeId = element;
        });
    }

    onScroll(e) {
        if ($(window).scrollTop() > 100) {
            $('.back-to-top-arrow').fadeIn();
            $('.faculty-user-guide-header').slideUp('fast');
            setTimeout(function () {
                $('.faculty-user-guide-menu').addClass('js-top-100');
            }, 200);
        } else {
            $('.back-to-top-arrow').fadeOut();
            $('.faculty-user-guide-header').slideDown('fast');
            setTimeout(function () {
                $('.faculty-user-guide-menu').removeClass('js-top-100');
            }, 200);
        }
    }
    
    
    expand(element: string) {
        $(element).toggleClass('in').prev('a').toggleClass('collapsed');

       if ($(element).hasClass('in')) {
        $(element).prev('a').attr('aria-expanded', 'true');
    } else  {
        $(element).prev('a').attr('aria-expanded', 'false');
    }
   }
   
   
    print(e: any): void {
        window.print();
        e.preventDefault();
    }

    showModal() {
        this.showTerms = true;
    }

    closeModal(e) {
        this.showTerms = false;
    }

}
   