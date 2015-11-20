import {Component, View} from 'angular2/angular2';
import {Router, Location} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
import {DashboardHeader} from './dashboard-header';
import {DashboardPod1} from './dashboard-pod1';
import {DashboardPod2} from './dashboard-pod2';
import {DashboardPod3} from './dashboard-pod3';
import {DashboardPod4} from './dashboard-pod4';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';

@Component({
  selector: 'home',
  viewBindings: [Auth, Common]
})
@View({
  templateUrl: '../../templates/home/home.html',
  directives: [PageHeader, DashboardHeader, DashboardPod1, DashboardPod2, DashboardPod3, DashboardPod4]
})
export class Home {
  constructor(router: Router, auth: Auth, location: Location, common: Common) {
    this.common = common;
    this.router = router;
    this.auth = auth;
    this.location = location;
    this.redirectToPage();
    this.initialize();
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
    this.hdusername=null;
    this.hdpassword=null;
    this.hdpage=null;
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
      console.log(this.institutionRN);
      console.log(this.institutionPN);
      console.log(this.page);
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
    console.log(this.hdInstitution.value);
    $(this.form).attr('ACTION', serverURL).submit();
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

  prepareRedirectToReports(page, form, hdusername, hdpassword, hdpage) {
      this.page=page;
      this.form = form;
      this.hdusername = hdusername;
      this.hdpassword = hdpassword;
      this.hdpage = hdpage;
      this.redirectToReports();
      return false;
  }
  redirectToReports() {
      var serverURL = this.common.nursingITServer + this.common.config.links.nursingit.ReportingLandingPage;
      this.hdusername.value =this.auth.username;
      this.hdpassword.value =this.auth.password;
      this.hdpage.value=this.page;
      $(this.form).attr('ACTION', serverURL).submit();
  }
  
}