import {Injectable, Inject} from '@angular/core';
import {Http, Response, RequestOptions, Headers, HTTP_PROVIDERS} from "@angular/http";
import {Auth} from './auth';
import {ProfileModel} from '../models/profile-model';
import * as _ from 'lodash';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class HomeService {
	auth: Auth;
	constructor(public http: Http) {	
		this.http = http;
		this.auth = new Auth(http);
		this.auth.refresh();
	}

	getProfiles(url):Observable<Response> {
		let self = this;
		let headers: Headers = new Headers({
			'Accept': 'application/json',
			'Authorization': self.auth.authheader
		});
		let requestOptions: RequestOptions = new RequestOptions({
			headers: headers,
			body:''
		});
		return this.http.get(url, requestOptions);
	}

	getProfile(url):Observable<Response> {
		let self = this;
		let headers: Headers = new Headers({
			'Accept': 'application/json',
			'Authorization': self.auth.authheader
		});
		let requestOptions: RequestOptions = new RequestOptions({
			headers: headers,
			body:''
		});
		return this.http.get(url, requestOptions);
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