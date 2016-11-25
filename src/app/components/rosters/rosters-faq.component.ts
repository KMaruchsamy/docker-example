import { Observable, Subscription } from 'rxjs/Rx';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { links, roster } from '../../constants/config';
import { Response } from '@angular/http';
import * as _ from 'lodash';
import { ProfileService } from './../../services/profile.service';
import { AuthService } from './../../services/auth.service';


@Component({
    selector: 'rosters-faq',
    providers: [ProfileService, AuthService],
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
    constructor(private profileService: ProfileService, private auth: AuthService) {
        this.classRosterFormUrl = roster.classRosterForm;
    }

  

    ngOnDestroy() {
        this.profileSubscription.unsubscribe();
    }

   

    loadProfileDescription(): void {
        let url = `${this.auth.common.getApiServer()}${links.api.baseurl}${links.api.admin.profilesapi}/${this.accountManagerId}`;
        let profileObservable: Observable<Response> = this.profileService.getProfile(url);
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

