import {Component, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from 'lodash';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';

@Component({
    selector: 'groups',
    providers: [Auth],
    templateUrl: 'templates/groups/groups.html',
    directives: [ROUTER_DIRECTIVES, PageHeader, PageFooter]
})

export class Groups implements OnInit {
    institutionName: string;
    constructor(public auth: Auth, public router: Router, public titleService: Title) {
    }

    ngOnInit(): void {
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else
            this.institutionName = this.getLatestInstitution();
        $(document).scrollTop(0);
        this.titleService.setTitle('Manage Groups – Kaplan Nursing');
    }

    getLatestInstitution(): string {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution)
                return latestInstitution.InstitutionName;
        }
        return '';
    }
}