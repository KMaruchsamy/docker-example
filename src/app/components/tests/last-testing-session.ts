import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {Common} from '../../services/common';
import {Auth} from '../../services/auth';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestService} from '../../services/test.service';


@Component({
    selector: 'last-testing-session',
    templateUrl: 'templates/tests/last-testing-session.html',
    directives: [ROUTER_DIRECTIVES, PageHeader, PageFooter]
})
export class LastTestingSession{
}