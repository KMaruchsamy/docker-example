import {Component} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {RouteParams, RouterLink} from '@angular/router-deprecated';
import {HomeService} from '../../services/home-service';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {ProfileModel} from '../../models/profile-model';

@Component({
    selector: 'profile-description',
    providers: [HomeService, Common],
    templateUrl: 'templates/home/profile-description.html',
    directives: [RouterLink, PageHeader, PageFooter, NgFor, NgIf]
})
export class ProfileDescription {
    kaplanAdminId: number;
    profile: ProfileModel;
    apiServer: string;
    constructor(public routeParams: RouteParams, public homeService: HomeService, public common: Common) {
        this.apiServer = this.common.getApiServer();
        this.kaplanAdminId = parseInt(this.routeParams.get('id'));
        this.profile = {}
        this.loadProfileDescription();
    }

    loadProfileDescription(): void {
        if (this.kaplanAdminId != null && this.kaplanAdminId > 0) {
            let url = this.apiServer + links.api.baseurl + links.api.admin.profilesapi + '/' + this.kaplanAdminId;
            let profilePromise = this.homeService.getProfile(url);
            let self: ProfileDescription = this;
            profilePromise.then((response) => {
                return response.json();
            })
                .then((json) => {
                    self.profile = self.homeService.bindToModel(json);
                    if (self.profile) {
                        if (self.profile.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER')
                            $('title').html('Your Account Manager &ndash; Kaplan Nursing');
                        else
                            $('title').html('Your Nurse Consultant &ndash; Kaplan Nursing');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

}