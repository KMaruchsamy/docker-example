import {Injectable, Inject} from '@angular/core';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "@angular/http";
import {Auth} from './auth';
import {ProfileModel} from '../models/profile-model';
import * as _ from 'lodash';

@Injectable()
export class HomeService {
	auth: Auth;
	constructor(public http: Http) {	
		this.http = http;
		this.auth = new Auth();
		this.auth.refresh();
	}

	getProfiles(url) {
		let self = this;
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Authorization': self.auth.authheader
			}
		});
	}

	getProfile(url) {
		let self = this;
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Authorization': self.auth.authheader
			}
		});
	}


	bindToModel(profile): ProfileModel {
		return new ProfileModel(
			profile.KaplanAdminId,
			profile.KaplanAdminTypeId,
			profile.KaplanAdminTypeName,
			profile.Active,
			profile.Bio,
			profile.Degrees,
			profile.FirstName,
			profile.LastName,
			profile.Designation,
			profile.Email,
			profile.LinksForFrontEnd,
			profile.BulletsForFrontEnd,
			(profile.Photo.PhotoUrl === null || profile.Photo.PhotoUrl === '') ? null : profile.Photo.PhotoUrl,
			profile.Telephone
		);
	}

}