import { RosterCohortStudentsModal } from './roster-cohort-students.modal';
export class RosterCohortsModal{
    cohortName: string;
    cohortId: number;
    studentCount: number;
    cohortStartDate: Date;
    cohortEndDate: Date;
    hasRepeatStudent: boolean;
    hasExpiredStudent: boolean;
    hasStudentPayDeactivatedStudent: boolean;
    students: Array<RosterCohortStudentsModal>;
    visible: boolean;
}