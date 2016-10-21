// import { HomeService } from './../../services/home-service';
import { Observable, Subscription } from 'rxjs/Rx';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { links, roster } from '../../constants/config';
import { Response } from '@angular/http';
// import { AuthService } from './../../services/auth';
import * as _ from 'lodash';
import { HomeService } from './../home/home.service';
import { AuthService } from './../../services/auth.service';


@Component({
    selector: 'rosters-faq',
    providers: [HomeService],
    templateUrl: 'components/rosters/rosters-faq.component.html',
    directives: []
})
export class RostersFaqComponent implements OnDestroy {
    _accountManagerId: number;
    @Input()
    set accountManagerId(value: number) {
        this._accountManagerId = value;
        this.loadProfileDescription();
    }
    get accountManagerId() {
        return this._accountManagerId;
    }


    visiblefaq1: boolean = false;
    visiblefaq2: boolean = false;
    visiblefaq3: boolean = false;
    visiblefaq4: boolean = false;
    profileSubscription: Subscription;
    accountManagerFirstName: string;
    accountManagerLastName: string;
    accountManagerPhoneNumber: string;
    accountManagerEmail: string;
    customChangeForm: string;
    classRosterFormUrl: string = roster.classRosterForm;
    constructor(private homeService: HomeService, private auth: AuthService) {
        this.classRosterFormUrl = roster.classRosterForm;
    }

  

    ngOnDestroy() {
        this.profileSubscription.unsubscribe();
    }

   

    loadProfileDescription(): void {
        let url = `${this.auth.common.getApiServer()}${links.api.baseurl}${links.api.admin.profilesapi}/${this.accountManagerId}`;
        let profileObservable: Observable<Response> = this.homeService.getProfile(url);
        let self: RostersFaqComponent = this;
        this.profileSubscription = profileObservable
            .map(response => response.json())
            .subscribe(json => {
                if (json) {
                    self.accountManagerEmail = json.Email;
                    self.accountManagerFirstName = json.FirstName;
                    self.accountManagerLastName = json.LastName;
                    self.accountManagerPhoneNumber = json.Telephone;
                    self.customChangeForm = json.LinksForFrontEnd[0].LinkUrl;
                } 
            },
            error => console.log(error.message),
            () => {
                //done callback
            });
    }
}

