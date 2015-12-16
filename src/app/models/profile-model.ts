import {links} from '../constants/config';

export class ProfileModel {
	public header: string = '';
	public isAccountManager: boolean = true;
	constructor(
		public kaplanAdminId?: number,
		public kaplanAdminTypeId?: number,
		public kaplanAdminTypeName?: string,
		public active?: boolean,
		public bio?: string,
		public degrees?: string,
		public firstName?: string,
		public lastName?: string,
		public designation?: string,
		public email?: string,
		public linksForFrontEnd?: Array<string>,
		public bulletsForFrontEnd?: any,
		public photoUrl?: string,
		public telephone?: any
	) {
		this.kaplanAdminId = (kaplanAdminId === null || kaplanAdminId === undefined) ? null : kaplanAdminId;
		if (kaplanAdminId) {
			this.kaplanAdminTypeId = kaplanAdminTypeId;
			this.kaplanAdminTypeName = kaplanAdminTypeName;
			this.active = active;
			this.bio = bio;
			this.email = email;
			this.degrees = degrees;
			this.firstName = firstName;
			this.lastName = lastName;
			this.designation = designation;
			this.linksForFrontEnd = linksForFrontEnd;
			this.bulletsForFrontEnd = bulletsForFrontEnd;
			this.photoUrl = (photoUrl == null) ? ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? links.profile.accountmanager.defaultimage : links.profile.nurseconsultant.defaultimage) : photoUrl;
			this.telephone = telephone;
			this.header = 'Your Kaplan ' + ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? 'Account Manager' : 'Nurse Consultant');
			this.isAccountManager = ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? true: false);
		}
		else {
			this.firstName = 'Coming';
			this.lastName = 'Soon!'
			if (kaplanAdminTypeName !== null || kaplanAdminTypeName !== undefined) {
				this.header = 'Your Kaplan ' + ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? 'Account Manager' : 'Nurse Consultant');
				this.isAccountManager = ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? true: false);
			}
			this.photoUrl = ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? links.profile.accountmanager.defaultimage : links.profile.nurseconsultant.defaultimage)
		}

	}
}