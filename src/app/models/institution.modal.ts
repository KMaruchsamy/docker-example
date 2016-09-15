import { Injectable } from '@angular/core';

@Injectable()
export class InstitutionModal{
    institutionId: number;
    institutionName: string;
    programOfStudyName: string;
    isIpBlank: boolean;
    timezoneDescription: string;
    timezoneName: string;
    hourOffset: number;
    nurseConsultantId: number;
    accountManagerId: number;
    studentPayEnabled: boolean;
    programId: number;
}