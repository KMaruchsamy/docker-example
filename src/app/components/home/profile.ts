import {Component, View, Input,NgFor} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {ProfileModel} from '../../models/profile-model';


@Component({
	selector: 'profile',
    inputs: ['profile']

})
@View({
	templateUrl: '../../templates/home/profile.html',
	directives:[RouterLink,NgFor]
})
export class Profile {
	// profile: ProfileModel;	
	constructor(){
		
	}
	onInit() {
		//console.log(this.profile);
	}
}
