import {Component, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Title} from '@angular/platform-browser';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
import * as _ from 'lodash';
// import {PageHeader} from '../shared/page-header';
// import {PageFooter} from '../shared/page-footer';
// import {HomeService} from '../../services/home-service';
import {links} from '../../constants/config';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';

@Component({
    selector: 'reports',
    providers: [AuthService, CommonService],
    templateUrl: 'components/reports/reports.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent, PageFooterComponent]
})

export class ReportsComponent implements OnInit {
    institutionRN: number;
    institutionPN: number;
    page: string;
    form: any;
    hdInstitution: any;
    hdToken: any;
    hdURL: any;
    hdpage: any;
    hdExceptionURL: any;
    apiServer: string;
    nursingITServer: string;
    institutionName: string;
    constructor(public auth: AuthService, public router: Router, public common: CommonService, public titleService: Title) {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
    }

    ngOnInit(): void {
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else
            this.institutionName = this.getLatestInstitution();
        window.scroll(0,0);
        this.titleService.setTitle('View Reports – Kaplan Nursing');
    }

    getLatestInstitution(): string {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution:any = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
            if (latestInstitution)
                return latestInstitution.InstitutionName;
        }
        return '';
    }

    prepareRedirectToReports(page, form, hdToken, hdpage, hdExceptionURL): boolean {
        this.page = page;
        this.form = form;
        this.hdToken = hdToken;
        this.hdpage = hdpage;
        this.hdExceptionURL = hdExceptionURL;
        this.redirectToReports();
        return false;
    }

    resolveExceptionPage(url): string {
        let resolvedURL = url.replace('§environment', this.common.getOrigin());
        return resolvedURL;
    }

    redirectToReports(): void {
        var serverURL = this.nursingITServer + links.nursingit.ReportingLandingPage;
        this.hdToken.value = this.auth.token;
        this.hdpage.value = this.page;
        this.hdExceptionURL.value = this.resolveExceptionPage(links.nursingit.exceptionpage);
        $(this.form).attr('ACTION', serverURL).submit();
    }

}


