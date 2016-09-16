import { HomeService } from './../../services/home-service';
import { Observable, Subscription } from 'rxjs/Rx';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { links, roster } from '../../constants/config';
import { Response } from '@angular/http';
import { Auth } from './../../services/auth';
import * as _ from 'lodash';


@Component({
    selector: 'rosters-faq',
    providers: [HomeService],
    templateUrl: 'templates/rosters/rosters-faq.html',
    directives: []
})
export class RostersFaq implements OnDestroy {
    // institutionId: number;
    // institutionName: string;
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
    classRosterFormUrl: string = roster.classRosterForm;
    constructor(private homeService: HomeService, private auth: Auth) {
        this.classRosterFormUrl = roster.classRosterForm;
    }

  

    ngOnDestroy() {
        this.profileSubscription.unsubscribe();
    }

   

    loadProfileDescription(): void {
        let url = `${this.auth.common.getApiServer()}${links.api.baseurl}${links.api.admin.profilesapi}/${this.accountManagerId}`;
        let profileObservable: Observable<Response> = this.homeService.getProfile(url);
        let self: RostersFaq = this;
        this.profileSubscription = profileObservable
            .map(response => response.json())
            .subscribe(json => {
                if (json) {
                    self.accountManagerEmail = json.Email;
                    self.accountManagerFirstName = json.FirstName;
                    self.accountManagerLastName = json.LastName;
                    self.accountManagerPhoneNumber = json.Telephone;
                }
            },
            error => console.log(error.message),
            () => {
                //done callback
            });
    }
}

