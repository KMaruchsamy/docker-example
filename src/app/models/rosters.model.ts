import { RosterCohortsModel } from './roster-cohorts.model';

export class RostersModal {
    institutionId: number;
    institutionName: string;
    programOfStudy: string;
    accountManagerId: number;
    accountManagerFirstName: string;
    accountManagerLastName: string;
    accountManagerEmail: string;
    studentPayEnabled: boolean;
    cohorts: Array<RosterCohortsModel>;
}