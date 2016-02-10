import {Component, Input} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {Router, RouterLink} from 'angular2/router';
import {ProfileModel} from '../../models/profile-model';


@Component({
	selector: 'profile',
    inputs: ['profile'],
	templateUrl: '../../templates/home/profile.html',
	directives:[RouterLink,NgFor]
})
export class Profile {
	// profile: ProfileModel;	
	constructor(){
		
	}
}
