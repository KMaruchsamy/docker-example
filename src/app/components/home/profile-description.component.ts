import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { links } from '../../constants/config';
import { CommonService } from './../../services/common.service';
import { LogService } from './../../services/log.service';
import { ProfileModel } from './../../models/profile.model';
import { ProfileService } from './profile.service';

@Component({
    selector: 'profile-description',
  templateUrl: './profile-description.component.html'
})

export class ProfileDescriptionComponent implements OnDestroy {
    kaplanAdminId: number;
    profile: ProfileModel;
    apiServer: string;
    routeParametersSubscription: Subscription;
    getProfileSubscription: Subscription;

    constructor(public activatedRoute: ActivatedRoute, public profileService: ProfileService, public common: CommonService, public titleService: Title, private log: LogService) {
        this.apiServer = this.common.getApiServer();
        this.routeParametersSubscription = this.activatedRoute.params.subscribe(params => {
            this.kaplanAdminId = +params['id'];
            this.loadProfileDescription();
        });

    }


    ngOnDestroy(): void {
        if (this.routeParametersSubscription)
            this.routeParametersSubscription.unsubscribe();
        if (this.getProfileSubscription)
            this.getProfileSubscription.unsubscribe();
    }

    loadProfileDescription(): void {
        if (this.kaplanAdminId != null && this.kaplanAdminId > 0) {
            let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '/' + this.kaplanAdminId;
            let profileObservable  = this.profileService.getProfile(url);
            let self: ProfileDescriptionComponent = this;
            this.getProfileSubscription = profileObservable
                .map(response => response.body)
                .subscribe(
                (json: any) => {
                    self.profile = self.profileService.bindToModel(json);
                    if (self.profile) {
                        if (self.profile.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER')
                            this.titleService.setTitle('Your Account Manager – Kaplan Nursing');
                        else
                            this.titleService.setTitle('Your Nurse Consultant – Kaplan Nursing');
                    }
                },
                error => console.log(error.message),
                () => console.log('complete !'));
        }
    }

}