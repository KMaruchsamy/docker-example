import {Component,View} from 'angular2/angular2';
import {Route, RouteParams} from 'angular2/router';
import {HomeService} from '../../services/home-service';

@Component({
	selector: 'profile-description'
})
@View({
	templateUrl: '../../templates/home/profile-description.html',
	directives:[RouteParams]
})
export class ProfileDescription{
	constructor(routeParams : RouteParams){
		this.routeParams = routeParams;
		this.kaplanAdminId  = this.routeParams.get('id');
		// console.log(this.kaplanAdminId);
	}
	
	loadProfileDescription(){		
		
	}
}