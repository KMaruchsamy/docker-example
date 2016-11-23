import {Component, OnDestroy} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';
import {Response} from '@angular/http';
import {Observable, Subscription} from 'rxjs/Rx';
import {Title} from '@angular/platform-browser';
import {links} from '../../constants/config';
import { ProfileService } from './../../services/profile.service';
import { CommonService } from './../../services/common.service';
import { LogService } from './../../services/log.service';
import { PageHeaderComponent } from './../shared/page-header.component';
import { PageFooterComponent } from './../shared/page-footer.component';
import { ProfileModel } from './../../models/profile.model';

@Component({
    selector: 'profile-description',
    providers: [ProfileService, CommonService, LogService],
    templateUrl: 'components/home/profile-description.component.html',
    directives: [ROUTER_DIRECTIVES, PageHeaderComponent, PageFooterComponent, NgFor, NgIf]
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
            this.profile = {}
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
            let profileObservable: Observable<Response> = this.profileService.getProfile(url);
            let self: ProfileDescriptionComponent = this;
            this.getProfileSubscription = profileObservable
                .map(response => response.json())
                .subscribe(
                json => {
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