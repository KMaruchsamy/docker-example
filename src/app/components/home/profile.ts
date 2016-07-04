import {Component, Input} from '@angular/core';
import {NgFor} from '@angular/common';
import {Router, RouterLink} from '@angular/router-deprecated';
import {ProfileModel} from '../../models/profile-model';


@Component({
	selector: 'profile',
    inputs: ['profile'],
	templateUrl: 'templates/home/profile.html',
	directives:[RouterLink,NgFor]
})
export class Profile {
	// profile: ProfileModel;	
	constructor(){
		
	}
}
