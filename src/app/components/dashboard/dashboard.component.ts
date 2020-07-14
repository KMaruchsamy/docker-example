import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import betaTemplate from '../../../assets/json/template_beta.json';
import nonBetaTemplate from '../../../assets/json/template_non_beta.json';
import { MatSelect } from '@angular/material/select';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileModel } from './../../models/profile.model';
import { links } from './../../constants/config';
import { ProfileService } from '../home/profile.service';
import { Subscription } from 'rxjs';
import { CommonService } from './../../services/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  templateJson: any;
  institutions: any[];
  isBetaInstitution = false;
  selectedInstitution;
  firstname: string;
  apiServer: string;
  nursingITServer: string;
  accountManagerProfile: ProfileModel;
  nurseConsultantProfile: ProfileModel;
  profilesSubscription: Subscription;
  @ViewChild(MatSelect, { static: true }) institutionList: MatSelect;

  constructor(public location: Location, public common: CommonService, public profileService: ProfileService, public auth: AuthService, public router: Router) {
    this.redirectToPage();
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.firstname = this.auth.firstname;
    this.templateJson = betaTemplate;
    this.auth.dashboardTemplate = JSON.stringify(this.templateJson);
    this.loadInstitutions();
    this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
    this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
    this.loadProfiles(this);
    this.updateTemplateToSession();
  }

  redirectToPage(): void {
    if (this.location.path().search("first") > 0) {
      if (this.auth.istemppassword && this.auth.isAuth())
        this.router.navigate(['/']);
    }
    else if (!this.auth.isAuth())
      this.router.navigate(['/']);
    else 
      this.getAllServers();
  }
  getAllServers() {
    this.apiServer = this.common.getApiServer();
  }
  updateTemplateToSession() {
    this.auth.dashboardTemplate = JSON.stringify(this.templateJson);
  }
  loadInstitutions() {
    this.institutions = (JSON.parse(this.auth.institutions) as any[]).sort(
      (a, b) => b.InstitutionId - a.InstitutionId
    );
    this.selectedInstitution = this.institutions[0];
    this.institutionList.value = this.selectedInstitution.InstitutionId;
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }

  loadTemplate() {
    this.templateJson = this.isBetaInstitution ? betaTemplate : nonBetaTemplate;
  }

  onInstitutionSelected(e) {
    this.selectedInstitution = this.institutions.find((i) => {
      return i.InstitutionId === e.value;
    });
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }

  loadProfiles(self): void {
    let institutionID = this.getLatestInstitution();
    if (institutionID > 0) {
      let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '?institutionId=' + institutionID;
      let profilesObservable = this.profileService.getProfiles(url);
      this.profilesSubscription = profilesObservable
        .map(response => response.body)
        .subscribe(json => {
          self.bindToModel(self, json);
        },
          error => console.log(error.message),
          () => console.log('complete')
        );
    }
    else {
      this.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
      this.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
    }
  }
  getLatestInstitution(): number {
    if (this.auth.institutions != null && this.auth.institutions != 'undefined') {
      let latestInstitution: any = JSON.parse(this.auth.institutions).sort((a, b) => b.InstitutionId - a.InstitutionId).shift();
      if (latestInstitution)
        return latestInstitution.InstitutionId;
    }
    return 0;
  }
  bindToModel(self, json): void {
    if (json) {
      json.forEach((profile, key) =>{
        if (profile && profile.KaplanAdminTypeName !== undefined) {
          if (profile.KaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') {
            self.accountManagerProfile = self.profileService.bindToModel(profile);
          }
          else {
            self.nurseConsultantProfile = self.profileService.bindToModel(profile);
          }
        }
      });
    }
    if (!self.accountManagerProfile.kaplanAdminTypeId)
      self.accountManagerProfile = new ProfileModel(null, null, 'ACCOUNTMANAGER', null, null, null, null, null, null, null, null, null, null, null);
    if (!self.nurseConsultantProfile.kaplanAdminTypeId)
      self.nurseConsultantProfile = new ProfileModel(null, null, 'NURSECONSULTANT', null, null, null, null, null, null, null, null, null, null, null);
  }
  ngOnDestroy() {
    if (this.profilesSubscription)
      this.profilesSubscription.unsubscribe();
  }
}
