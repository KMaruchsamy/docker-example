import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { links } from '../../constants/config';
import { Response } from '@angular/http';
import { AuthService } from './../../services/auth.service';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { ProfileService } from '../home/profile.service';

@Component({
    selector: 'rosters-AM-info',
    templateUrl: './rosters-AM-info.component.html',
    styleUrls: ['./rosters-AM-info.component.css']
})

export class RostersAMInfoComponent implements OnDestroy {
    @Input() rosterChangesModel: RosterChangesModel;

    _accountManagerId: number;
    @Input()
    set accountManagerId(value: number) {
        this._accountManagerId = value;
        this.loadProfileDescription();
    }
    get accountManagerId() {
        return this._accountManagerId;
    }

    profileSubscription: Subscription;
    accountManagerFirstName: string;
    accountManagerLastName: string;
    accountManagerPhoneNumber: string;
    accountManagerPhotoURI: string;

    constructor(private profileService: ProfileService, private auth: AuthService) {}
  
    ngOnDestroy() {
        if (this.profileSubscription)
        this.profileSubscription.unsubscribe();
    }

    loadProfileDescription(): void {
        let url = `${this.auth.common.getApiServer()}${links.api.baseurl}${links.api.admin.profilesapi}/${this.accountManagerId}`;
        let profileObservable: Observable<Response> = this.profileService.getProfile(url);
        let self: RostersAMInfoComponent = this;
        this.profileSubscription = profileObservable
            .map(response => response.json())
            .subscribe(json => {
                if (json) {
                    self.rosterChangesModel.accountManagerFirstName = json.FirstName;
                    self.rosterChangesModel.accountManagerLastName = json.LastName;
                    self.rosterChangesModel.accountManagerPhoneNumber = json.Telephone;
                    self.rosterChangesModel.accountManagerEmail = json.Email;
                    self.rosterChangesModel.accountManagerPhotoURI = json.Photo.PhotoUrl;
                } 
            },
            error => console.log(error.message),
            () => {
                //done callback
            });
    }

}

