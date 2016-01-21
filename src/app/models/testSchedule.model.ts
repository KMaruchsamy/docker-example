export class TestScheduleModel{
    scheduleId: any;
    subjectId: number;
    testId: number;
    testName: string;
    scheduleStartDate: Date;
    scheduleStartTime: any;
    scheduleEndDate: Date;
    scheduleEndTime: any;
    currentStep: number;
    activeStep: number; 
    scheduleTiming: string;
    completed: boolean = false;
    institutionId :number
    constructor(){}
}