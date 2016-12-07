import {Injectable} from '@angular/core';
import { ChangeUpdateRosterStudentsModal } from './change-update-roster-students.model';

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
    students: Array<ChangeUpdateRosterStudentsModal>;
}
