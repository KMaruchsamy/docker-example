import {SelectedStudentModel} from './selectedStudent-model';

export class TestScheduleModel{
    scheduleId: any = 0;
    scheduleName: string = '';
    subjectId: number = 0;
    testId: number = 0;
    testName: string = '';
    testNormingStatus: string = '';
    scheduleStartTime: any ;
    scheduleEndTime: any;
    currentStep: number = 0;
    activeStep: number = 0; 
    scheduleTiming: string = '';
    institutionId: number =0;
    lastselectedcohortId: number = 0;
    selectedStudents: SelectedStudentModel[] = [];
    facultyMemberId: number = 0;
    pageSavedOn: string = '';
    constructor(){}
}