import {Component, OnDestroy} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';
import {Response} from '@angular/http';
import {Observable, Subscription} from 'rxjs/Rx';
import {Title} from '@angular/platform-browser';
import {HomeService} from '../../services/home-service';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {ProfileModel} from '../../models/profile-model';
import {Log} from '../../services/log';

@Component({
    selector: 'profile-description',
    providers: [HomeService, Common, Log],
    templateUrl: 'templates/home/profile-description.html',
    directives: [ROUTER_DIRECTIVES, PageHeader, PageFooter, NgFor, NgIf]
})
export class ProfileDescription implements OnDestroy {
    kaplanAdminId: number;
    profile: ProfileModel;
    apiServer: string;
    routeParametersSubscription: Subscription;
    getProfileSubscription: Subscription;
    constructor(public activatedRoute: ActivatedRoute, public homeService: HomeService, public common: Common, public titleService: Title, private log: Log) {
        this.apiServer = this.common.getApiServer();
        this.routeParametersSubscription = this.activatedRoute.params.subscribe(params => {
            this.kaplanAdminId = +params['id'];
            this.profile = {}
            this.loadProfileDescription();
        });

    }

    ngOnDestroy(): void {
        if(this.routeParametersSubscription)
            this.routeParametersSubscription.unsubscribe();
        if(this.getProfileSubscription)
        this.getProfileSubscription.unsubscribe();
    }

    loadProfileDescription(): void {
        if (this.kaplanAdminId != null && this.kaplanAdminId > 0) {
            let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '/' + this.kaplanAdminId;
            let profileObservable: Observable<Response> = this.homeService.getProfile(url);
            let self: ProfileDescription = this;
            this.getProfileSubscription = profileObservable
                .map(response => response.json())
                .subscribe(
                json => {
                    self.profile = self.homeService.bindToModel(json);
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