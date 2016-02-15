import {Injectable, Inject} from 'angular2/core';

@Injectable()
export class SelectedStudentModel {
    StudentId: number;
    FirstName: string;
    LastName: string;
    StudentTestId: number;
    StudentTestName: string;
    CohortId: number;
    CohortName: string;
    Email: string;
    Retester: boolean;
    Ada: boolean;
    NormingId: number;
    NormingStatus: string;
    constructor() {
    }
    resetData(): void {
        this.StudentId = 0;
        this.FirstName="";
        this.LastName="";
        this.StudentTestId=0;
        this.StudentTestName = "";
        this.CohortId = 0;
        this.CohortName = "";
        this.Email = "";
        this.Retester = false;
        this.Ada = false;
        this.NormingId = 0;
        this.NormingStatus = "";
    }
}