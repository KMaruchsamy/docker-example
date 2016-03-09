import {Component, OnInit} from 'angular2/core';
import {RouterLink, CanActivate} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links, constants} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {ParseDatePipe} from '../../pipes/parseDate.pipe';

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
        this.activeId = '#whatsNew';
        $('title').html('Faculty User Guide &ndash; Kaplan Nursing');
        this.modifiedDate = new Date(constants.USERGUIDEMODIFICATIONDATE);
    }
    
    scroll(element: string, e: any) {
        e.preventDefault();
        let __this = this;
        let offset = $('.faculty-user-guide-header').position().top + parseInt($('.faculty-user-guide-header').outerHeight());
        if ($(element).is('.h5, .h6')) { //if element is a subelement add 15px margin (may want to refactor and add specific classes)
          offset = offset + 15;
        }
        $('html, body').animate({
            scrollTop: $(element).offset().top - offset
        }, 500, 'swing',function () {
             __this.activeId = element;
        });
    }


    print(e: any): void {
        window.print();
        e.preventDefault();
    }

    onScroll(e) {
        if ($(window).scrollTop() > 100) {
            $('.back-to-top-arrow').fadeIn();
        } else {
            $('.back-to-top-arrow').fadeOut();
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


}