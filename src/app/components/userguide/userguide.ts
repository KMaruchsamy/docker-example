import {Component, OnInit} from 'angular2/core';
import {CanActivate} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';

@Component({
    selector: 'userguide',
    templateUrl: '../../templates/userguide/userguide.html',
    directives: [PageHeader, PageFooter]
})
export class UserGuide implements OnInit {
    constructor() {
    }

    ngOnInit(): void {
        $('title').html('Faculty User Guide &ndash; Kaplan Nursing');
    }
    scroll(id: string, e) {
        alert($(id).offset().top);
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $(id).offset().top - 70
        }, 2000);
    }
}