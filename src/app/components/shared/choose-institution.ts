import {View, Component} from 'angular2/angular2';
import {Router, RouterLink, RouteParams} from 'angular2/router';
import {PageHeader} from './page-header';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import * as _ from '../../lib/index';
import {links} from '../../constants/config';

@Component({
    selector: 'choose-institution',
	viewBindings: [Common, Auth]
})
@View({
    templateUrl: '../../templates/shared/choose-institution.html',
	directives: [PageHeader, RouterLink]
})

export class ChooseInstitution {
	fromPage: string;
	page: string;
	institutionRN: string;
	institutionPN: string;
	backMessage: string;
	nursingITServer: string;
	constructor(public router: Router, public routeParams: RouteParams, public common: Common, public auth: Auth) {
		this.nursingITServer = this.common.getNursingITServer();
		this.fromPage = this.routeParams.get('frompage');
		this.page = this.routeParams.get('redirectpage');
		this.institutionRN = this.routeParams.get('idRN');
		this.institutionPN = this.routeParams.get('idPN');
		this.setBackMessage();
	}

	setBackMessage() {
		switch (this.fromPage.toUpperCase()) {
			case "LOGIN":
				this.backMessage = 'Cancel and return to Sign In';
				break;
			case "HOME":
				this.backMessage = 'Cancel and return to Faculty Home';
				break;
			default:
				this.backMessage = 'Cancel and return to Faculty Home';
				break;
		}
	}


	triggerRedirect(programType, myform, hdInstitution, hdToken, hdPage, event) {
		var serverURL = this.nursingITServer + links.nursingit.landingpage;
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