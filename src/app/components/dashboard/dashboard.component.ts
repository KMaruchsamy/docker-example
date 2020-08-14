import { AuthService } from "./../../services/auth.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import betaTemplate from "../../../assets/json/template_beta.json";
import nonBetaTemplate from "../../../assets/json/template_non_beta.json";
import { MatSelect } from "@angular/material/select";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { ProfileModel } from "./../../models/profile.model";
import { links, dataKey, ItSecurity } from "./../../constants/config";
import { ProfileService } from "../home/profile.service";
import { Subscription } from "rxjs";
import { CommonService } from "./../../services/common.service";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
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
  announcementText: string;
  dataKeys: string[] = [];
  announcementSubscription: Subscription;
  profilesSubscription: Subscription;
  @ViewChild(MatSelect, { static: true }) institutionList: MatSelect;

  constructor(
    public location: Location,
    public common: CommonService,
    public titleService: Title,
    public profileService: ProfileService,
    public auth: AuthService,
    public router: Router
  ) {
    this.redirectToPage();
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.titleService.setTitle('Faculty Home – Kaplan Nursing');
    this.firstname = this.auth.firstname;
    this.loadInstitutions();
    this.accountManagerProfile = new ProfileModel(
      null,
      null,
      'ACCOUNTMANAGER',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    this.nurseConsultantProfile = new ProfileModel(
      null,
      null,
      'NURSECONSULTANT',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    (window as any).Appcues.identify(this.auth.userid, {
      firstname: this.auth.firstname,
      lastname: this.auth.firstname,
      email: this.auth.useremail,
      beta: this.auth.selectedInstitution.IsBetaInstitution
    });
  }

  redirectToPage(): void {
    if (this.location.path().search('first') > 0) {
      if (this.auth.istemppassword && this.auth.isAuth())
        this.router.navigate(['/']);
    } else if (!this.auth.isAuth()) this.router.navigate(['/']);
    else this.getServers();
  }
  getServers() {
    this.apiServer = this.common.getApiServer();
  }
  updateTemplateToSession() {
    this.auth.dashboardTemplate = JSON.stringify(this.templateJson);
  }
  loadInstitutions() {
    this.institutions = (JSON.parse(this.auth.institutions) as any[]).sort(
      (a, b) => b.InstitutionId - a.InstitutionId
    );
    this.selectedInstitution = this.getSelectedInstitution();
    if (!this.selectedInstitution)
      this.selectedInstitution = this.institutions[0];
    this.saveInstitution(this.selectedInstitution);
    if(this.institutions.length>1)
      this.institutionList.value = this.selectedInstitution.InstitutionId;
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }

  getSelectedInstitution() {
    let selectedInstitution;
    const selectedInstitutionJSON = this.auth.selectedInstitution;
    if (selectedInstitutionJSON && selectedInstitutionJSON.length > 0) {
      selectedInstitution = JSON.parse(selectedInstitutionJSON);
    }
    return selectedInstitution;
  }

  loadTemplate() {
    this.templateJson = JSON.parse(JSON.stringify(this.isBetaInstitution ? betaTemplate : nonBetaTemplate));  //To do deep copy
    this.updateTemplateToSession();
    this.getDataKeys();
  }

  onInstitutionSelected(e) {
    this.selectedInstitution = this.institutions.find(i => {
      return i.InstitutionId === e.value;
    });
    this.saveInstitution(this.selectedInstitution);
    this.isBetaInstitution = this.selectedInstitution.IsBetaInstitution;
    this.loadTemplate();
  }

  saveInstitution(institution) {
   this.auth.selectedInstitution = JSON.stringify(institution);
  }

  loadProfiles(self, key): void {
    let institutionID = this.selectedInstitution.InstitutionId; 
    if (institutionID > 0) {
      const url =
        this.apiServer +
        links.api.baseurl +
        links.api.admin.profilesapi +
        '?institutionId=' +
        institutionID;
      const profilesObservable = this.profileService.getProfiles(url);
      this.profilesSubscription = profilesObservable
        .map(response => response.body)
        .subscribe(
          json => {
            self.bindToModel(self, json, key);
          },
          (error) => self.bindToModel(self, null, key),
          () => console.log("complete")
        );
    } else {
      self.bindToModel(self, null, key)
    }
  }
  bindToModel(self, json, key): void {
    self.accountManagerProfile = null;
    self.nurseConsultantProfile = null;
    if (json) {
      json.forEach((profile, key) => {
        if (profile && profile.KaplanAdminTypeName !== undefined) {
          if (profile.KaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') {
            self.accountManagerProfile = self.profileService.bindToModel(
              profile
            );
          } else {
            self.nurseConsultantProfile = self.profileService.bindToModel(
              profile
            );
          }
        }
      });
    }
    if (self.accountManagerProfile && !self.accountManagerProfile.kaplanAdminTypeId)
      self.accountManagerProfile = new ProfileModel(
        null,
        null,
        'ACCOUNTMANAGER',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );
    if (self.nurseConsultantProfile && !self.nurseConsultantProfile.kaplanAdminTypeId)
      self.nurseConsultantProfile = new ProfileModel(
        null,
        null,
        'NURSECONSULTANT',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      );

    this.updateProfileCard(key);
  }

  getAnnouncementContent(key) {
    const announcementURL = `${this.apiServer}${links.api.baseurl}${links.api.admin.announcements}`;
    const announcementObservable = this.auth.getAPIResponse(announcementURL);
    this.announcementSubscription = announcementObservable
      .map(response => response)
      .subscribe(
        data => {
          this.announcementText = data.toString();
          this.assignValueToCardContent(key, this.announcementText, 0, "content");
          this.updateTemplateToSession();
        },
        error => console.log(error)
      );
  }
  getDataKeys() {
    this.dataKeys = [];
    this.templateJson.content.sections.forEach((section) => {
      section.panels.forEach((panel) => {
        panel.data_key ? this.dataKeys.push(panel.data_key) : this.dataKeys;
        panel.cards.forEach(card => {
          card.data_key ? this.dataKeys.push(card.data_key) : this.dataKeys;
          if(card["links"]) {
            card.links.forEach((link) => {
              link.data_key ? this.dataKeys.push(link.data_key) : this.dataKeys;
            });
          }
        });
      });
    });
    this.apiCallBasedOnDataKey();
  }

  assignValueToCardContent(key, value, position, propertyToUpdate) {
    this.templateJson.content.sections.forEach((section) => {
      section.panels.forEach((panel) => {
        if (panel["data_key"] === key) {
          panel.cards.forEach((card, index) => {
            if (index === position) {
              card[propertyToUpdate] = value;
            }
          });
        } else {
          panel.cards.forEach((card, index) => {
            if (index === position && card["data_key"] === key) {
              card[propertyToUpdate] = value;
            }else {
             if(!value) this.removeLinkBasedOnDatakey(key, position, card);
            }
          });
        }
      });
    });
  }

  removeLinkBasedOnDatakey(key, position, card) {
    if(card["links"]){
      card.links.forEach((link, index) => {
        if(link["data_key"] === key){
          if ( key === "iHP") {
            card.links.splice(index,1);
          }
          if ((key === "ITSecurity" ) && link["itsecurity_key"] == position) {
            card.links.splice(index,1);
          } 
        }
      });
    } 
  }
  updateProfileCard(key) {
    this.assignValueToCardContent(key, this.accountManagerProfile, 0, "content");
    this.assignValueToCardContent(key, this.nurseConsultantProfile, 1, "content");
    this.updateTemplateToSession();
  }
  apiCallBasedOnDataKey() {
    this.dataKeys.forEach(datakey => {
      switch (datakey.toLowerCase()) {
        case dataKey.Announcement:
          this.getAnnouncementContent(datakey);
          break;
        case dataKey.Profile:
          this.loadProfiles(this, datakey);
          break;
        case dataKey.IHP:
          this.removeIHPReportLink(datakey);
          break;
        case dataKey.ITSecurity:
          this.removeITSecurityReportLink(datakey);
          break;
      }
    });
  }

  removeIHPReportLink(key) {
    let ihpEnableInstitutions = JSON.parse(this.auth.institutions).filter(institution => { return (institution.IsIHPEnabledForAnyCohorts && (institution.InstitutionId == this.selectedInstitution.InstitutionId))});
    let hasIhpEnableInstitution = ihpEnableInstitutions.length > 0 ? true : false;
    if(!hasIhpEnableInstitution) {
      this.assignValueToCardContent(key, hasIhpEnableInstitution, 0, "");
      this.updateTemplateToSession();
    }
  }

  removeITSecurityReportLink(key) {
    const ITSecurities = [ItSecurity.Examity,ItSecurity.ProctorTrack];
    let iTSecurityEnabled = ITSecurities.includes(this.selectedInstitution.ITSecurityEnabled) ? true : false;
    if(iTSecurityEnabled) {
      switch(this.selectedInstitution.ITSecurityEnabled) {
        case ItSecurity.ProctorTrack:
          this.assignValueToCardContent(key, iTSecurityEnabled, ItSecurity.ProctorTrack, "");
          this.assignValueToCardContent(key, !iTSecurityEnabled, ItSecurity.Examity, "");
          break;
        case ItSecurity.Examity:
          this.assignValueToCardContent(key, !iTSecurityEnabled, ItSecurity.ProctorTrack, "");
          this.assignValueToCardContent(key, iTSecurityEnabled, ItSecurity.Examity, "");
          break;
      }
    }else {
        this.assignValueToCardContent(key, iTSecurityEnabled, ItSecurity.ProctorTrack, "");
        this.assignValueToCardContent(key, iTSecurityEnabled, ItSecurity.Examity, "");
    }   
      this.updateTemplateToSession();
  }
  ngOnDestroy() {
    if (this.profilesSubscription) this.profilesSubscription.unsubscribe();
    if (this.announcementSubscription)
      this.announcementSubscription.unsubscribe();
  }
}
