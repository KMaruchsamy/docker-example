import {Component, View} from 'angular2/angular2';
import {Router, Location} from 'angular2/router';
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
  viewBindings: [Auth, Common, HomeService]
})
@View({
  templateUrl: '../../templates/home/home.html',
  directives: [PageHeader, PageFooter, DashboardHeader, DashboardPod1, DashboardPod2, DashboardPod3, DashboardPod4, Profile]
})
export class Home {
  constructor(router: Router, auth: Auth, location: Location, common: Common, homeService: HomeService) {
    this.common = common;
    this.router = router;
    this.auth = auth;
    this.location = location;
    this.homeService = homeService;
    this.redirectToPage();
    this.initialize();
    this.profiles = [];
    let self = this;
    this.loadProfiles(self);
  }


  loadProfiles(self) {
    let institutionID = this.getLatestInstitution();
    if (institutionID > 0) {
      let url = this.common.apiServer + links.api.baseurl + links.api.admin.profilesapi + '?institutionId=' + institutionID;
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
  }

  bindToModel(self, json) {
    let profiles = _.sortByOrder(json, 'KaplanAdminTypeId', 'desc');
    if (json) {
      let i = 0;
      _.forEach(profiles, function (profile, key) {
        self.profiles.push(self.homeService.bindToModel(profile, (((i % 2) == 0) ? true : false)));
        i++;
      });
    }
  }

  redirectToPage() {
    if (this.location.path().search("first") > 0) {
      if ((this.auth.istemppassword == "true" ? true : false) && this.auth.isAuth())
        this.router.parent.navigateByUrl('/login');
    }
    else if (!this.auth.isAuth())
      this.router.parent.navigateByUrl('/login');
  }

  initialize() {
    $('title').html('Faculty Home  |  Kaplan Nursing');
    this.institutionRN = 0;
    this.institutionPN = 0;
    this.page = null;
    this.form = null;
    this.hdInstitution = null;
    this.hdToken = null;
    this.hdURL = null;
    this.hdpage = null;
  }

  redirectToLogin(event) {
    event.preventDefault();
    this.router.parent.navigateByUrl('/login');
  }

  prepareRedirectToStudentSite(page, form, hdInstitution, hdToken, hdURL) {
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


  redirectToStudentSite() {
    var serverURL = this.common.nursingITServer + this.common.config.links.nursingit.landingpage;
    this.hdInstitution.value = (this.institutionRN > 0) ? this.institutionRN : this.institutionPN;
    this.hdToken.value = this.auth.token
    this.hdURL.value = this.page;
    $(this.form).attr('ACTION', serverURL).submit();
  }

  getLatestInstitution() {
    if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
      let latestInstitution = _.first(_.sortByOrder(JSON.parse(this.auth.institutions), 'InstitutionId', 'desc'))
      if (latestInstitution)
        return latestInstitution.InstitutionId;
    }
    return 0;
  }

  checkInstitutions() {
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

  prepareRedirectToReports(page, form, hdToken, hdpage) {
    this.page = page;
    this.form = form;
    this.hdToken = hdToken;
    this.hdpage = hdpage;
    this.redirectToReports();
    return false;
  }

  redirectToReports() {
    var serverURL = this.common.nursingITServer + this.common.config.links.nursingit.ReportingLandingPage;
    this.hdToken.value = this.auth.token;
    this.hdpage.value = this.page;
    $(this.form).attr('ACTION', serverURL).submit();
  }

}