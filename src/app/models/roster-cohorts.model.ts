import { RosterCohortStudentsModel } from './roster-cohort-students.model';
export class RosterCohortsModel{
    cohortName: string;
    cohortId: number;
    studentCount: number;
    cohortStartDate: Date;
    cohortEndDate: Date;
    hasRepeatStudent: boolean;
    hasExpiredStudent: boolean;
    hasDuplicateStudent: boolean;
    hasStudentPayDeactivatedStudent: boolean;
    students: Array<RosterCohortStudentsModel>;
    visible: boolean;
}
