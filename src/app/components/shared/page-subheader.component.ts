import { AnalyticsService } from './../../services/analytics.service';
import { Component, Input } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import {links} from '../../constants/config';
import { Subscription } from 'rxjs';
import betaTemplate from '../../../assets/json/template_beta.json';
import { Router } from '@angular/router';

@Component({
    selector:'page-subheader',
    templateUrl:'./page-subheader.component.html',
    styleUrls: ['./page-subheader.component.scss']
})
export class PageSubheaderComponent {
  apiServer: string;
  announcementText: string;
  announcementSubscription: Subscription;
  @Input() showCover: boolean;
  subheader: any;
  templateJson: any;

  constructor(public common: CommonService, public auth: AuthService, public router: Router, private analyticsService: AnalyticsService) {
    this.apiServer = this.common.getApiServer();
  }
  
  ngOnInit() {
    this.updateUIBasedOnTemplate();
  }
  updateUIBasedOnTemplate() {
    this.subheader = (this.auth.dashboardTemplate) ? JSON.parse(this.auth.dashboardTemplate).subheader : this.getSubHeaderFromTemplate();
  }

  getSubHeaderFromTemplate():any {
    this.templateJson = betaTemplate;
    return this.templateJson.subheader;
  }

  gotToHelp() {
    const self = this;
    document.getElementsByClassName('subheader-link')[0].addEventListener('click', function (event) {
      self.analyticsService.track('click', { category: 'UrgentHelpBaner' });
      self.router.navigate(['/help']);
    } );
  }

  getAnnouncementContent() {        
    let announcementURL = `${this.apiServer}${links.api.baseurl}${links.api.admin.announcements}`;
    let announcementObservable  = this.auth.getAPIResponse(announcementURL);
    this.announcementSubscription = announcementObservable
        .map(response => response)
        .subscribe(data => {
        this.announcementText = data.toString();
         
      }, error => console.log(error));
 }

  ngAfterViewInit() {
    this.gotToHelp();
  }

 ngOnDestroy() {
   if(this.announcementSubscription) {
     this.announcementSubscription.unsubscribe();
   }
 }
}
