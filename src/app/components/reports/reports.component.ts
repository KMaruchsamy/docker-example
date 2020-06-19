import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { links } from '../../constants/config';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
    selector: 'reports',
    templateUrl: './reports.component.html'
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
    ItSecurityEnabled: boolean = false;
    examityEncryptedUserId: string;
    examityServer:string;
    examityLoginURL:string;
    constructor(private http: HttpClient, public auth: AuthService, public router: Router, public common: CommonService, public titleService: Title) {
        this.apiServer = this.common.getApiServer();
        this.nursingITServer = this.common.getNursingITServer();
    }

    ngOnInit(): void {
        this.examityServer = this.common.getExamityServer();
        this.examityLoginURL = this.examityServer + links.examity.login;
        this.ItSecurityEnabled = this.auth.isExamityEnabled();
        if (!this.auth.isAuth())
            this.router.navigate(['/']);
        else
            this.institutionName = this.getLatestInstitution();
        window.scroll(0, 0);
        this.titleService.setTitle('View Reports – Kaplan Nursing');
    }

    getLatestInstitution(): string {
        if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
            let latestInstitution: any = _.first(_.orderBy(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
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

    onClickExamityProfile(ssologin, encryptedUsername_val): void {
        let facultyAPIUrl = this.resolveFacultyURL(`${this.common.apiServer}${links.api.baseurl}${links.api.admin.examityProfileapi}`);
        let examityObservable  = this.setFacultyProfileInExamity(facultyAPIUrl);
        examityObservable.subscribe(response => {
            this.examityEncryptedUserId = response.body.toString();
            encryptedUsername_val.value = this.examityEncryptedUserId
            ssologin.submit();
        }, error => console.log(error));
    }

    setFacultyProfileInExamity(url: string)  {
        let self = this;
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': self.auth.authheader
        });
        let options = {
            headers : headers,
            observe: 'response' as const
        };
        return this.http.get(url, options);
    }

    resolveFacultyURL(url: string): string {
        return url.replace('§adminId', this.auth.userid.toString());
    }

}


