import {Component, OnInit} from 'angular2/core';
import {RouterLink, CanActivate} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links, constants} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {ParseDatePipe} from '../../pipes/parsedate.pipe';

@Component({
    selector: 'userguide',
    templateUrl: '../../templates/userguide/userguide.html',
    host: {
        '(window:scroll)': 'onScroll($event)'
    },
    directives: [PageHeader, PageFooter, RouterLink],
    pipes: [ParseDatePipe]
})
export class UserGuide implements OnInit {
    modifiedDate: Date;
    activeId: string;
    constructor() {
    }

    ngOnInit(): void {
        $(document).scrollTop(0);
        this.activeId = '#whatsNew';
        $('title').html('Faculty User Guide &ndash; Kaplan Nursing');
        this.modifiedDate = new Date(constants.USERGUIDEMODIFICATIONDATE);
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
        $(element).prev('a').attr('aria-expanded', true);
    } else  {
        $(element).prev('a').attr('aria-expanded', false);
    }
   }
   
   
    print(e: any): void {
        window.print();
        e.preventDefault();
    }

}
   
   