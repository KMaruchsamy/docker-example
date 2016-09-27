import { Component, OnInit} from '@angular/core';
import { Router, ROUTER_DIRECTIVES } from '@angular/router';
import { Title} from '@angular/platform-browser';

import { Auth } from '../../services/auth';
import * as _ from 'lodash';

import { PageHeader } from '../shared/page-header';
import { PageFooter } from '../shared/page-footer';

import { RostersCohorts } from './rosters-cohorts';
import { RostersMultiCampus } from './rosters-multicampus';
import { RostersHeader } from './rosters-header';
import { RostersFaq } from './rosters-faq';
import { RostersSearch } from './rosters-search';
import { NgIf } from '@angular/common';


@Component({
    selector: 'rosters',
    providers: [],
    templateUrl: 'templates/rosters/rosters.html',
    directives: [ROUTER_DIRECTIVES, PageHeader, PageFooter, RostersFaq, RostersHeader, RostersMultiCampus, RostersCohorts, RostersSearch, NgIf]
})

export class Rosters implements OnInit {
    accountManagerId: number;
    institutionId: number;
    institutionName: string;
    institutions: Array<any> = [];
    constructor(public auth: Auth, public router: Router, public titleService: Title) {
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