import {Component, Input, OnInit, OnChanges,SimpleChanges} from '@angular/core';
import {NgFor} from '@angular/common';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {ProfileModel} from '../../models/profile-model';


@Component({
	selector: 'profile',
	templateUrl: 'templates/home/profile.html',
	directives: [ROUTER_DIRECTIVES, NgFor]
})
export class Profile implements OnInit, OnChanges {
	@Input() profile: ProfileModel;
	constructor() {

	}

	ngOnChanges(changes:SimpleChanges): void{
		 console.log('ngOnChanges - myProp = ' + changes['profile'].currentValue);
	}

	ngOnInit(): void {
		console.log(this.profile);
	}
}
