import {Component, Injector, Inject} from 'angular2/core';
import {Router, Location, CanActivate} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {DashboardHeader} from './dashboard-header';
import {DashboardPod1} from './dashboard-pod1';
import {DashboardPod2} from './dashboard-pod2';
import {DashboardPod3} from './dashboard-pod3';
import {DashboardPod4} from './dashboard-pod4';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {ProfileModel} from '../../models/profile-model';
import {Profile} from './profile';
import {HomeService} from '../../services/home-service';
import {links} from '../../constants/config';

@Component({
  selector: 'home',
  providers: [Auth, Common, HomeService],
  templateUrl: '../../templates/home/home.html',
  directives: [PageHeader, PageFooter, DashboardHeader, DashboardPod1, DashboardPod2, DashboardPod3, DashboardPod4, Profile]
})
@CanActivate((next, prev) => {
  // let authInjector = Injector.resolveAndCreate([Auth]);
  // let auth = authInjector.get(Auth);
  // return auth.isAuth();
  return true;
})
export class Home {
  // profiles: Array<ProfileModel>;
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
  accountManagerProfile: ProfileModel;
  nurseConsultantProfile: ProfileModel;
  constructor(public router: Router, public auth: Auth, public location: Location, public common: Common, public homeService: HomeService) {
    this.apiServer = this.common.getApiServer();
    this.nursingITServer = this.common.getNursingITServer();
    this.redirectToPage();
    this.initialize();
    // this.profiles = [];
    let self = this;
    this.accountManagerProfile = {};
    this.nurseConsultantProfile = {};
    this.loadProfiles(self);
  }

  loadProfiles(self): void {
    let institutionID = this.getLatestInstitution();
    if (institutionID > 0) {
      let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '?institutionId=' + institutionID;
      let profilePromise = this.homeService.getProfiles(url);
      profilePromise.then((response) => {
        return response.json();
      })
        .then((json) => {
          self.bindToModel(self, json);
        })
        .catch((error) => {
          alert(error);
        });
    }
    else {
      this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
      this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
    }
  }

  bindToModel(self, json): void {
    if (json) {
      _.forEach(json, function(profile, key) {
        if (profile && profile.KaplanAdminTypeName !== undefined) {
          if (profile.KaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') {
            self.accountManagerProfile = self.homeService.bindToModel(profile);
          }
          else {
            self.nurseConsultantProfile = self.homeService.bindToModel(profile);
          }
        }
      });
    }
    if (!self.accountManagerProfile.kaplanAdminTypeId)
      self.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
    if (!self.nurseConsultantProfile.kaplanAdminTypeId)
      self.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
  }

  redirectToPage(): void {
      if (this.location.path().search("first") > 0) {
          if (this.auth.istemppassword && this.auth.isAuth())
              this.router.parent.navigateByUrl('/');
      }
      else if (!this.auth.isAuth())
          this.router.parent.navigateByUrl('/');
  }

  initialize(): void {
    $('title').html('Faculty Home &ndash; Kaplan Nursing');
    this.institutionRN = 0;
    this.institutionPN = 0;
    this.page = null;
    this.form = null;
    this.hdInstitution = null;
    this.hdToken = null;
    this.hdURL = null;
    this.hdpage = null;
  }

  redirectToLogin(event): void {
    event.preventDefault();
    this.router.parent.navigateByUrl('/');
  }

  prepareRedirectToStudentSite(page, form, hdInstitution, hdToken, hdURL): boolean {
    this.page = page;
    this.form = form;
    this.hdInstitution = hdInstitution;
    this.hdToken = hdToken;
    this.hdURL = hdURL;
    this.checkInstitutions();

    if (this.institutionRN > 0 && this.institutionPN > 0) {
      // open the interstitial page here ...
      // this.router.parent.navigate(['/ChooseInstitution', { page: this.page, idRN: this.institutionRN, idPN: this.institutionPN }]);
      this.router.parent.navigateByUrl(`/choose-institution/Home/${this.page}/${this.institutionRN}/${this.institutionPN}`);
    }
    else {
      this.redirectToStudentSite();
    }
    return false
  }


  redirectToStudentSite(): void {
    var serverURL = this.nursingITServer + links.nursingit.landingpage;
    this.hdInstitution.value = (this.institutionRN > 0) ? this.institutionRN : this.institutionPN;
    this.hdToken.value = this.auth.token
    this.hdURL.value = this.page;
    $(this.form).attr('ACTION', serverURL).submit();
  }

  getLatestInstitution(): number {
    if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
      let latestInstitution = _.first(_.sortByOrder(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
      if (latestInstitution)
        return latestInstitution.InstitutionId;
    }
    return 0;
  }

  checkInstitutions(): void {
    let institutions = _.sortByOrder(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc');
    if (institutions != null && institutions != 'undefined') {
      let institutionsRN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'RN' }), 'InstitutionId');
      let institutionsPN = _.pluck(_.filter(institutions, { 'ProgramofStudyName': 'PN' }), 'InstitutionId');
      if (institutionsRN.length > 0)
        this.institutionRN = institutionsRN[0];
      if (institutionsPN.length > 0)
        this.institutionPN = institutionsPN[0];
    }
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