import {Component, OnInit} from 'angular2/core';
import {CanActivate} from 'angular2/router';
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
    directives: [PageHeader, PageFooter],
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


}