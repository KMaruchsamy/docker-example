import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {HomeService} from '../../services/home-service';
import {links} from '../../constants/config';

@Component({
    selector: 'reports',
    providers: [Auth, Common],
    templateUrl: '../../templates/reports/reports.html',
    directives: [RouterLink, PageHeader, PageFooter]
})

export class Reports {
    institutionRN: number;
    institutionPN: number;
    page: string;
    form: any;
    hdInstitution: any;
    hdToken: any;
    hdURL: any;
    hdpage: any;
    apiServer: string;
    nursingITServer: string;
    institutionName: string;
    constructor(public auth: Auth, public router: Router, public common: Common) {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
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

    prepareRedirectToReports(page, form, hdToken, hdpage): boolean {
        this.page = page;
        this.form = form;
        this.hdToken = hdToken;
        this.hdpage = hdpage;
        this.redirectToReports();
        return false;
    }

    redirectToReports(): void {
        var serverURL = this.nursingITServer + links.nursingit.ReportingLandingPage;
        this.hdToken.value = this.auth.token;
        this.hdpage.value = this.page;
        $(this.form).attr('ACTION', serverURL).submit();
    }

}


