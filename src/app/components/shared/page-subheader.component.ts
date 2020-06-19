import { Component } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import {links} from '../../constants/config';
import { Subscription } from 'rxjs';

@Component({
    selector:'page-subheader',
    templateUrl:'./page-subheader.component.html',
    styles:[`
    .ad{
        padding:2px 10px;
        font-size:8pt;
        border-radius:2px;
    }

    .red{
        background-color:#BD2828;
        color:#FFF;
    }

    .covid-yellow {
        background-color: #feee67;
      }

    `]
})
export class PageSubheaderComponent {
  apiServer: string;
  announcementText: string;
  announcementSubscription: Subscription;

  constructor(public common: CommonService, public auth: AuthService) {
    this.apiServer = this.common.getApiServer();
  }
  
  ngOnInit() {
    this.getAnnouncementContent();
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

 ngOnDestroy() {
   if(this.announcementSubscription) {
     this.announcementSubscription.unsubscribe();
   }
 }
}
