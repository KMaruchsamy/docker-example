import {links} from '../constants/config';

export class ProfileModel {
	public header: string;
	constructor(
		public kaplanAdminId,
		public kaplanAdminTypeId,
		public kaplanAdminTypeName,
		public active,
		public bio,
		public degrees,
		public firstName,
		public lastName,
		public designation,
		public email,
		public linksForFrontEnd,
		public bulletsForFrontEnd,
		public photoUrl,
		public telephone,
		public isLeft = true
	) {
		if (kaplanAdminId) {
			this.kaplanAdminId = kaplanAdminId == null ? 0 : kaplanAdminId;
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
			this.isLeft = isLeft;
		}

	}
}