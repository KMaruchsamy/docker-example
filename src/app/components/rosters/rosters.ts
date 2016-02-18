import {Component, OnInit} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';

@Component({
    selector: 'rosters',
    providers: [Auth],
    templateUrl: '../../templates/rosters/rosters.html',
    directives: [RouterLink, PageHeader, PageFooter]
})

export class Rosters implements OnInit {
    institutionName: string;
    constructor(public auth: Auth, public router: Router) {

    }

    ngOnInit(): void {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.institutionName = this.getLatestInstitution();
    }

    getLatestInstitution(): string {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution = _.first(_.sortByOrder(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution)
                return latestInstitution.InstitutionName;
        }
        return '';
    }
}