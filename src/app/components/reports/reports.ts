import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';

@Component({
    selector: 'reports',
    providers: [Auth],
    templateUrl: '../../templates/reports/reports.html',
    directives: [RouterLink, PageHeader, PageFooter]
})

export class Reports {
    constructor(public auth: Auth, public router: Router) {

    }
}