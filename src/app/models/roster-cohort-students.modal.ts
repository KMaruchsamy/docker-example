export class RosterCohortStudentsModal {
    studentId: number;
    firstName: string;
    lastName: string;
    email: string;
    cohortId: number;
    cohortName: string;
    repeatExpiryDate: Date;
    userExpireDate: Date;
    studentPayInstitution: boolean;
    isRepeatStudent: boolean;
    isExpiredStudent: boolean;
    isStudentPayDeactivatedStudent: boolean;
    isDuplicate: boolean;
}