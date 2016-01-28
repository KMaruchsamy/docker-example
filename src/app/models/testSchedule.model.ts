export class TestScheduleModel{
    scheduleId: any;
    subjectId: number;
    testId: number;
    testName: string;
    scheduleStartTime: any;
    scheduleEndTime: any;
    currentStep: number;
    activeStep: number; 
    scheduleTiming: string;
    completed: boolean = false;
    institutionId :number
    constructor(){}
}