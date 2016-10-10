import {Component, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Title} from '@angular/platform-browser';
import * as _ from 'lodash';
import { AuthService } from './../../services/auth.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';

@Component({
    selector: 'groups',
    providers: [AuthService],
    templateUrl: 'components/groups/groups.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent, PageFooterComponent]
})

export class GroupsComponent implements OnInit {
    institutionName: string;
    constructor(public auth: AuthService, public router: Router, public titleService: Title) {
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