import {Component, OnInit} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';

@Component({
    selector: 'groups',
    providers: [Auth],
    templateUrl: '../../templates/groups/groups.html',
    directives: [RouterLink, PageHeader, PageFooter]
})

export class Groups implements OnInit {
    institutionName: string;
    constructor(public auth: Auth, public router: Router) {

    }

    ngOnInit(): void {
        if (!this.auth.isAuth())
            this.router.navigateByUrl('/');
        else
            this.institutionName = this.getLatestInstitution();
        $(document).scrollTop(0);
        $('title').html('Manage Groups &ndash; Kaplan Nursing');
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