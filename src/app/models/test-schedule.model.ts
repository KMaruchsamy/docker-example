import {SelectedStudentModel} from './selected-student.model';

export class TestScheduleModel{
    scheduleId: any = 0;
    scheduleName: string = '';
    subjectId: number = 0;
    testId: number = 0;
    testName: string = '';
    testNormingStatus: string = '';
    savedStartTime: any;
    savedEndTime: any;
    scheduleStartTime: any;
    scheduleEndTime: any;
    currentStep: number = 0;
    activeStep: number = 0; 
    scheduleTiming: string = '';
    institutionId: number = 0;
    institutionName: string = '';    
    institutionNameWithProgramOfStudy: string = '';    
    lastselectedcohortId: number = 0;
    selectedStudents: SelectedStudentModel[] = [];
    adminId: number = 0;
    adminFirstName: string = '';
    adminLastName: string = '';
    facultyMemberId: number = 0;
    facultyFirstName: string = '';
    facultyLastName: string = '';
    pageSavedOn: string = '';  
    status: string = '';
    spanMultipleDays: boolean = false;
    dateCreated: any;
    lastUpdated: any;
    constructor(){}
}