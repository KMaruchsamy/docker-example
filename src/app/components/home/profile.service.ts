import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { AuthService } from './../../services/auth.service';
import { ProfileModel } from './../../models/profile.model';
import { Router } from '@angular/router';

@Injectable()
export class ProfileService {
	auth: AuthService;
	constructor(public http: HttpClient, public router: Router) {	
		this.http = http;
		this.auth = new AuthService(http,router);
		this.auth.refresh();
	}

	getProfiles(url) {
		let self = this;
		const headers = new HttpHeaders({
			'Accept': 'application/json',
			'Authorization': self.auth.authheader
		});
		let requestOptions = {
			headers: headers,
            observe: 'response' as const
		};
		return this.http.get(url, requestOptions);
	}

	getProfile(url) {
		let self = this;
		const headers = new HttpHeaders({
			'Accept': 'application/json',
			'Authorization': self.auth.authheader
		});
		let requestOptions = {
			headers: headers,
			// body:'',
			observe: 'response' as const
		};
		return this.http.get(url, requestOptions);
	}

	getIhpSsoLogin(url:string, input:any){
		let self = this;
		const headers = new HttpHeaders({
			'Accept': 'application/json',
            'Content-Type': 'application/json',
			'Authorization': self.auth.authheader
		});
		let requestOptions = {
			headers: headers
		};
		return this.http.post(url, input, requestOptions);
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