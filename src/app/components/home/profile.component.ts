import {Component, Input} from '@angular/core';
import { ProfileModel } from './../../models/profile.model';


@Component({
	selector: 'profile',
	templateUrl: './profile.component.html'
})
export class ProfileComponent {
	@Input() profile: ProfileModel;
}
