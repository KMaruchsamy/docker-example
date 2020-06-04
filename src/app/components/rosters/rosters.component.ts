import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Title} from '@angular/platform-browser';
import { AuthService } from './../../services/auth.service';

@Component({
    selector: 'rosters',
    templateUrl: './rosters.component.html'
})

export class RostersComponent implements OnInit {
    accountManagerId: number;
    institutionId: number;
    institutionName: string;
    institutions: Array<any> = [];
    constructor(public auth: AuthService, public router: Router, public titleService: Title) {
    }

    ngOnInit(): void {
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else {
            if (this.auth.institutions) {
                this.institutions = JSON.parse(this.auth.institutions);
                if (this.institutions.length === 1) {
                    this.institutionId = this.institutions[0].InstitutionId;
                    this.institutionName = this.institutions[0].InstitutionName;
                    this.accountManagerId = this.institutions[0].AccountManagerId;
                }
                else {
                    this.latestInstitution();
                }
            }
            //Appcues.start();
            this.titleService.setTitle('View Rosters – Kaplan Nursing');
        }
        
    }

    latestInstitution(): void {
        if (this.auth.institutions != null && this.auth.institutions != undefined && this.auth.institutions != '') {
            let latestInstitution: any = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution) {
                this.accountManagerId = latestInstitution.AccountManagerId;
            }
        }
    }

    onInstitutionChange(institutionId: number) {
        let institution: any = _.find(this.institutions, { 'InstitutionId': +institutionId });
        if (institution) {
            this.institutionId = institution.InstitutionId;
            this.institutionName = institution.InstitutionName;
            this.accountManagerId = institution.AccountManagerId;
        }
    }

}