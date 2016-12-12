import { Injectable } from '@angular/core';

@Injectable()
export class RosterChangesStudentModel{
    studentId: number;
    firstName: string;
    lastName: string;
    fromCohortId: number;
    fromCohortName: string;
    toCohortId?: number;
    toCohortName?: string;
    markAsRepeater?: boolean;
    makeInactive?: boolean;
    grantUntimedTests?: boolean;
    updateType?: number;
}