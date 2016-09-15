import { RosterCohortsModal } from './roster-cohorts.modal';

export class RostersModal {
    institutionId: number;
    institutionName: string;
    institutionNameWithProgOfStudy: string;
    accountManagerId: number;
    accountManagerFirstName: string;
    accountManagerLastName: string;
    accountManagerEmail: string;
    studentPayEnabled: boolean;
    cohorts: Array<RosterCohortsModal>;
}