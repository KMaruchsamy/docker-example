import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
// import {CommonService} from '../../services/common';
// import {AuthService} from '../../services/auth';
// import {PageHeader} from '../shared/page-header';
// import {PageFooter} from '../shared/page-footer';
// import {TestService} from '../../services/test.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';


@Component({
    selector: 'last-testing-session',
    templateUrl: 'components/tests/last-testing-session.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent, PageFooterComponent]
})
export class LastTestingSessionComponent{
}