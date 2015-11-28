import {Injectable, Inject} from 'angular2/angular2';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "angular2/http";
import {Auth} from './auth';
import {ProfileModel} from '../models/profile-model';
import * as _ from '../lib/index';

@Injectable()
export class HomeService {
	constructor(public http: Http,public auth: Auth) {
		this.http = http;
		this.auth = auth;
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


	bindToModel(profile, isLeft = true):ProfileModel {
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
			profile.Telephone,
			isLeft
			);
	}

}