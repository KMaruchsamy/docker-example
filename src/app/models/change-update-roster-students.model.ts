import { Injectable } from '@angular/core';

@Injectable()
export class ChangeUpdateRosterStudentsModel {
    studentId: number;
    moveFromCohortId: number = null;
    moveFromCohortName: string = null;
    moveToCohortId?: number = null;
    moveToCohortName?: string = null;
    firstName: string;
    lastName: string;
    email: string;
    isInactive?: boolean = null;
    isRepeater?: boolean = null;
    isGrantUntimedTest?: boolean = null;
    isExtendAccess?: boolean = null;
    userExpiryDate?: boolean = null;
    updateType?: number;  //Based on Request for change/Move/Add/Extend Access [1/2/3/4]
    addedFrom?: number;
}
