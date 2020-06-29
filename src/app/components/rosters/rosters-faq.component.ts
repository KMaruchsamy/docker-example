import { Subscription } from 'rxjs';
import { Component, Input, OnDestroy } from '@angular/core';
import { links, roster } from '../../constants/config';
import { AuthService } from './../../services/auth.service';
import { ProfileService } from '../home/profile.service';


@Component({
    selector: 'rosters-faq',
    templateUrl: './rosters-faq.component.html'
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
    classRosterFormstackUrl: string = roster.formstack;

    constructor(private homeService: ProfileService, private auth: AuthService) {
        this.classRosterFormUrl = roster.classRosterForm;
    }

  

    ngOnDestroy() {
        this.profileSubscription.unsubscribe();
    }

   

    loadProfileDescription(): void {
        let url = `${this.auth.common.getApiServer()}${links.api.baseurl}${links.api.admin.profilesapi}/${this.accountManagerId}`;
        let profileObservable = this.homeService.getProfile(url);
        let self: RostersFaqComponent = this;
        this.profileSubscription = profileObservable
            .map(response => response.body)
            .subscribe((json: any) => {
                if (json) {
                    self.accountManagerEmail = json.Email;
                    self.accountManagerFirstName = json.FirstName;
                    self.accountManagerLastName = json.LastName;
                    self.accountManagerPhoneNumber = json.Telephone;
                    self.customChangeForm = (json.LinksForFrontEnd && json.LinksForFrontEnd.length > 0) ? json.LinksForFrontEnd[0].LinkUrl : '';
                } 
            },
            error => console.log(error.error.message),
            () => {
                //done callback
            });
    }
}

