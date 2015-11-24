import {Component, View} from 'angular2/angular2';
import {RouteParams, RouterLink} from 'angular2/router';
import {HomeService} from '../../services/home-service';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';

@Component({
	selector: 'profile-description',
	viewProviders: [HomeService, Common]
})
@View({
	templateUrl: '../../templates/home/profile-description.html',
	directives: [RouterLink,PageHeader,PageFooter]
})
export class ProfileDescription {
	constructor(routeParams: RouteParams, homeService: HomeService, common: Common) {
		this.routeParams = routeParams;
		this.homeService = homeService;
		this.common = common;
		this.kaplanAdminId = this.routeParams.get('id');
		this.profile = {};
		let self = this;
		this.loadProfileDescription(self);		
	}

	loadProfileDescription(self) {
		let objResponse = null;
		if (this.kaplanAdminId != null && this.kaplanAdminId > 0) {
			let url = this.common.apiServer + links.api.baseurl + links.api.admin.profilesapi + '/' + this.kaplanAdminId;
			let profilePromise = this.homeService.getProfile(url);
			profilePromise.then((response) => {
				objResponse = response;
				return response.json();
			})
				.then((json) => {
					if (!!objResponse.ok){
						self.profile = self.homeService.bindToModel(json,true);						
					}						
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}






}