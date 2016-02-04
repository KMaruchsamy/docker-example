import {Injectable, Inject} from 'angular2/core';

@Injectable()
export class SelectedStudentModel {
    studentId: number;
    firstName: string;
    lastName: string;
    studentTestId: number;
    studentTestName: string;
    studentCohortId: number;
    studentCohortName: string;
    studentEmail: string;
    retester: boolean;
    ADA: boolean;
    constructor() {
    }
    resetData(): void {
        this.studentId = 0;
        this.firstName="";
        this.lastName="";
        this.studentTestId=0;
        this.studentTestName = "";
        this.studentCohortId = 0;
        this.studentCohortName = "";
        this.studentEmail = "";
        this.retester = false;
        this.ADA = false;
    }
}