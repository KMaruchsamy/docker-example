import {View, Component} from 'angular2/angular2';
import {Router, RouterLink, RouteParams} from 'angular2/router';
import {PageHeader} from './page-header';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';

@Component({
    selector: 'choose-institution',
	viewBindings: [Common, Auth]
})
@View({
    templateUrl: '../../templates/shared/choose-institution.html',
	directives: [PageHeader, RouterLink]
})

export class ChooseInstitution {
	constructor(router: Router, routeParams: RouteParams, common: Common, auth: Auth) {
		this.common = common;
		this.auth = auth;
		this.router = router;
		this.routeParams = routeParams;
		this.fromPage = this.routeParams.get('frompage');
		this.page = this.routeParams.get('redirectpage');
		this.institutionRN = this.routeParams.get('idRN');
		this.institutionPN = this.routeParams.get('idPN');
	}

	triggerRedirect(programType, myform, hdInstitution, hdToken, hdPage, event) {
		var serverURL = this.common.nursingITServer + this.common.config.links.nursingit.landingpage;
		hdInstitution.value = programType === 'RN' ? this.institutionRN : this.institutionPN
		hdToken.value = this.auth.token
		hdPage.value = this.page;
		$(myform).attr('ACTION', serverURL).submit();
		return false;
	}

	goBack() {
		switch (this.fromPage.toUpperCase()) {
			case "LOGIN":
				this.auth.logout();
				this.router.parent.navigateByUrl('/login');
				break;
			case "HOME":
				this.router.parent.navigateByUrl('/home');
				break;
			default:
				this.router.parent.navigateByUrl('/home');
				break;
		}
	}
}