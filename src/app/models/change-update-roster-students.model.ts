import { Injectable } from '@angular/core';

@Injectable()
export class ChangeUpdateRosterStudentsModal {
    studentId: number;
    moveFromCohortId: number = null;
    moveFromCohortName: string = null;
    moveToCohortId: number = null;
    moveToCohortName: string = null;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean = null;
    isRepeater: boolean = null;
    isGrantUntimedTest: boolean = null;
    updateType: number;  //Based on Request for change/Move/Add [1/2/3]
}