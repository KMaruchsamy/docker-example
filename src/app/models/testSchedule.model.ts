export class TestScheduleModel{
    subjectID: number;
    testID: number;
    testName: string;
    scheduleStartDate: Date;
    scheduleStartTime: any;
    scheduleEndDate: Date;
    scheduleEndTime: any;
    currentStep: number;
    scheduleTiming: string;
    completed: boolean = false;
    institutionId :number
    constructor(){}
}