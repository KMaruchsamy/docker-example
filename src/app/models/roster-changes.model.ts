import {Injectable} from '@angular/core';

@Injectable()
export class RosterChangesModel {
    institutionId: number;
    institutionName: string;
    cohortId: number;
    cohortName: string;
    accountManagerId: number;
    accountManagerFirstName: string;
    accountManagerLastName: string;
    accountManagerPhoneNumber: string;
    accountManagerPhotoURI: string;
}
