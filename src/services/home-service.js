import {Injectable} from 'angular2/angular2';
import {Http, Response, RequestOptions, Headers, HHTP_PROVIDERS} from "angular2/http";
import {Auth} from './auth';

@Injectable()
export class HomeService {
	constructor(http: Http, auth: Auth) {
		this.http = http;
		this.auth = auth;
	}

	getProfiles(url) {
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': this.auth.authheader
			}
		});
	}
	
	getProfile(url) {
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': this.auth.authheader
			}
		});
	}
}