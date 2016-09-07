import {Injectable} from '@angular/core';
import {TestScheduleModel} from './testSchedule.model';

@Injectable()
export class TestsModal{
    institutionId: number;
    institutionName: string;
    institutionNameWithProgramOfStudy: string;
    tests: Array<TestScheduleModel>;
}

