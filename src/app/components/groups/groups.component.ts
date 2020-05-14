import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../services/auth.service';

@Component({
    selector: 'groups',
    templateUrl: './groups.component.html'
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
        window.scroll(0,0);
        this.titleService.setTitle('Manage Groups – Kaplan Nursing');
    }

    getLatestInstitution(): string {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution:any = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution)
                return latestInstitution.InstitutionName;
        }
        return '';
    }
}
