import {links} from '../constants/config.js';

export class ProfileModel {
	constructor(
		kaplanAdminId,
		kaplanAdminTypeId,
		kaplanAdminTypeName,
		active,
		bio,
		firstName,
		lastName,
		designation,
		email,
		linksForFrontEnd,
		bulletsForFrontEnd,
		photoUrl,
		telephone
		) {
		if (kaplanAdminId) {
			this.kaplanAdminId = kaplanAdminId==null ? 0 :kaplanAdminId;
			this.kapanAdminTypeId = kaplanAdminTypeId;
			this.kaplanAdminTypeName = kaplanAdminTypeName;
			this.active = active;
			this.bio = bio;
			this.firstName = firstName;
			this.lastName = lastName;
			this.designation = designation;
			this.linksForFrontEnd = linksForFrontEnd;
			this.bulletsForFrontEnd = bulletsForFrontEnd;
			this.photoUrl = (photoUrl != null) ? ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? links.profile.accountmanager.defaultimage : links.profile.nurseconsultant.defaultimage) : photoUrl;
			this.telephone = telephone;
			this.header = 'Your Kaplan ' + ((this.kaplanAdminTypeName.toUpperCase() === 'ACCOUNTMANAGER') ? 'Account Manager' : 'Nurse Consultant');
		}

	}
}