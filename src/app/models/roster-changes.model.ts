import {Injectable} from '@angular/core';
import { ChangeUpdateRosterStudentsModel } from './change-update-roster-students.model';

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
    students: Array<ChangeUpdateRosterStudentsModel>;
    instructions?: string;
}
