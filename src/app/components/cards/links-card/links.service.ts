import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service';
import { links } from '../../../constants/config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LinksService implements OnDestroy {
  apiServer: string;
  examityServer: string;
  nitServer: string;

  ihpSSOLoginSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private common: CommonService,
    private http: HttpClient,
    private router: Router
  ) {
    this.apiServer = this.common.getApiServer();
    this.nitServer = this.common.getNursingITServer();
    this.examityServer = this.common.getExamityServer();
  }

  redirect(link) {
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('target', link.target);

    const i = document.createElement('input');
    i.setAttribute('type', 'hidden');
    i.setAttribute('name', 'jwtToken');
    i.value = this.auth.token;

    const s = document.createElement('input');
    s.setAttribute('type', 'hidden');
    s.setAttribute('name', 'redirectPage');
    s.value = link.name;

    const x = document.createElement('input');
    x.setAttribute('type', 'hidden');
    x.setAttribute('name', 'exceptionURL');
    x.value = this.resolveExceptionPage(links.nursingit.exceptionpage);

    const y = document.createElement('input');
    y.setAttribute('type', 'hidden');
    y.setAttribute('name', 'institutionID');

    form.appendChild(i);
    form.appendChild(s);
    form.appendChild(x);
    form.appendChild(y);

    const formData = new FormData();
    formData.append('jwtToken', this.auth.token);
    formData.append('redirectPage', link.name);
    formData.append(
      'exceptionURL',
      this.resolveExceptionPage(links.nursingit.exceptionpage)
    );

    let url: string;
    if(s.value ==='ApolloStudentReportCard')
      url = `${this.nitServer}${links.nursingit.apolloLaunchPage}${"adminId="}${this.auth.userid}`;
    else
      url = `${this.nitServer}${links.nursingit.ReportingLandingPage}`;

    form.setAttribute('ACTION', url);
    document.body.appendChild(form);
    form.submit();
  }

  resolveExceptionPage(url): string {
    const resolvedURL = url.replace('§environment', this.common.getOrigin());
    return resolvedURL;
  }

  schedule(route) {
    const institutionId = this.getSelectedInstitution();
    this.router.navigateByUrl(`${route}/${institutionId}`);
  }

  getSelectedInstitution() {
    const selectedInstitution = JSON.parse(
      this.auth.selectedInstitution
    );
    if (selectedInstitution) return selectedInstitution.InstitutionId;
  }

  callToProctortrackReport() {
    let input = JSON.stringify({
        first_name: this.auth.firstname,
        last_name: this.auth.lastname,
        user_id: this.auth.userid,
        email: this.auth.useremail,
        role: "Instructor",
        institution_id: this.getSelectedInstitution(),
        group_id: []
      });
    let facultyAPIUrl = `${this.apiServer}${links.api.baseurl}${links.api.admin.proctortrackReportapi}`;
    let proctortrackObservable  = this.auth.postApiCall(facultyAPIUrl, input);
    proctortrackObservable.subscribe(response => {
        window.open(response.body.toString(),'blank');
    }, error => console.log(error));
}

onClickExamityProfile(link) {
  
  let facultyAPIUrl = this.resolveFacultyURL(`${this.apiServer}${links.api.baseurl}${links.api.admin.examityProfileapi}`);
  let examityObservable  = this.getHttpCall(facultyAPIUrl);
  examityObservable.subscribe(response => {
     let examityEncryptedUserId = response.body.toString();
     this.getForm(link,examityEncryptedUserId);
  }, error => console.log(error));
}

getForm(link, userid) {
  const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('target', link.target);
    const y = document.createElement('input');
    y.setAttribute('type', 'hidden');
    y.setAttribute('name', 'username');
    y.value = userid;
    form.appendChild(y);
    const url = `${this.examityServer}${links.examity.login}`;
    form.setAttribute('ACTION', url);
    document.body.appendChild(form);
    form.submit();
}

resolveFacultyURL(url: string): string {
  return url.replace('§adminId', this.auth.userid.toString());
}

callToIHPssoLogin() {
    let input = {
      UserId: this.auth.userid,
      FirstName: this.auth.firstname,
      LastName: this.auth.lastname,
      EmailAddress: this.auth.useremail,
      InstitutionId: this.getSelectedInstitution()
    };
    let ihpSSOLoginURL = `${this.apiServer}${links.api.baseurl}${links.api.admin.ihpSSoLoginApi}`;
    let ihpSSOLoginObservable = this.postHttpCall(
      ihpSSOLoginURL,
      JSON.stringify(input)
    );
    this.ihpSSOLoginSubscription = ihpSSOLoginObservable
      .map(response => response)
      .subscribe(
        (data:any) => {
          let htmlSnippet = data.toString();
          this.appendHTMLSnippetToDOM(htmlSnippet);
        },
        error => console.log(error)
      );
  }

  appendHTMLSnippetToDOM(htmlSnippet: string) {
    const formScript = document
      .createRange()
      .createContextualFragment(htmlSnippet);
      document.body.appendChild(formScript);
  }

  getHttpCall(url: string)  {
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

  postHttpCall(url: string, input: any) {
    let self = this;
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: self.auth.authheader
    });
    let requestOptions = {
      headers: headers
    };
    return this.http.post(url, input, requestOptions);
  }

  ngOnDestroy() {
    if (this.ihpSSOLoginSubscription)
      this.ihpSSOLoginSubscription.unsubscribe();
  }
}
