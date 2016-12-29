import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidationsService } from '../../services/validations.service';
import { RosterUpdateTypes } from '../../constants/config';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import { RosterService } from './roster.service';
import { links } from '../../constants/config';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs/Rx';

@Component({
    selector: 'rosters-add-to-cohort',
    templateUrl: './rosters-change-add-to-cohort.component.html',
    styleUrls: ['./rosters-change-move-to-cohort.component.css']
})
export class RosterChangeAddToCohortComponent implements OnInit {
    collapsed: boolean = true;
    @Input() rosterChangesModel;
    valid: boolean = false;
    firstName: string;
    lastName: string;
    email: string;
    untimed: boolean;
    rosterUpdateType: typeof RosterUpdateTypes = RosterUpdateTypes;
    @Output() addToCohortEvent = new EventEmitter();
    @Output() removeAddedStudentEvent = new EventEmitter();
    @Output() removeMovedStudentEvent = new EventEmitter();
    @Output() moveExistingStudentEvent = new EventEmitter();
    @Output() updateUntimedEvent = new EventEmitter();
    @Output() updateRepeaterEvent = new EventEmitter();
    @Output() updateAddedStudentUntimedEvent = new EventEmitter();
    existingStudents: Array<ChangeUpdateRosterStudentsModel> = [];
    emailValidateSubscription: Subscription;
    constructor(private common: CommonService, private validations: ValidationsService, private rosterSerivice: RosterService) { }

    ngOnInit() {

    }

    checkValid(): void {
        if (this.firstName && this.lastName && this.email && this.validations.validateEmailFormat(this.email))
            this.valid = true;
        else
            this.valid = false;
    }

    addToCohort(): void {

        let alreadyAdded: boolean = _.some(this.rosterChangesModel.students, { 'email': this.email });
        if (alreadyAdded) {
            alert('Student with the same email already added ..');
            return;
        }


        // let sameEmailStudents: Array<any> = [{
        //     studentId: 245543,
        //     firstName: "Candice",
        //     lastName: "Allen",
        //     email: "callen@mailinator.com",
        //     cohortId: 5148,
        //     cohortName: "Inactive",
        //     repeatExpiryDate: null,
        //     userExpireDate: null,
        //     studentPayInstitution: true,
        //     isActive: false
        // },
        // {
        //     studentId: 100959,
        //     firstName: "Cassandra",
        //     lastName: "Amos",
        //     email: "amoscr@mailinator.com",
        //     cohortId: 3330,
        //     cohortName: "May 2012",
        //     repeatExpiryDate: null,
        //     userExpireDate: null,
        //     studentPayInstitution: true,
        //     isActive: false
        // }];


        let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.addEmailValidation}`;
        url = url.replace("§institutionId", this.rosterChangesModel.institutionId.toString()).replace("§cohortId", this.rosterChangesModel.cohortId.toString()).replace('§searchString', this.email);

        let emailValidateObservable = this.rosterSerivice.addEmailValidation(url);
        this.emailValidateSubscription = emailValidateObservable
            .map(response => response.json())
            .finally(() => {
                this.resetModal();
                this.checkValid();
            })
            .subscribe((json: any) => {
                if (json && json.StudentId && json.StudentId > 0) {
                    let existingStudent: ChangeUpdateRosterStudentsModel = new ChangeUpdateRosterStudentsModel();
                    existingStudent.studentId = json.studentId;
                    existingStudent.firstName = json.firstName;
                    existingStudent.lastName = json.lastName;
                    existingStudent.email = json.email;
                    existingStudent.moveFromCohortId = json.cohortId;
                    existingStudent.moveFromCohortName = json.cohortName;
                    this.existingStudents.push(existingStudent);
                }
                else {
                    this.addToCohortEvent.emit({
                        firstName: this.firstName,
                        lastName: this.lastName,
                        email: this.email,
                        unTimedTest: this.untimed,
                        updateType: RosterUpdateTypes.AddToThisCohort,
                        addedFrom: RosterUpdateTypes.AddToThisCohort
                    });
                }
            }, error => console.log(error));


    }

    private resetModal() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.untimed = false;
    }

    removeAddedStudent(student: ChangeUpdateRosterStudentsModel, e: any) {
        e.preventDefault();
        this.removeAddedStudentEvent.emit(student);
    }

    clearToAddStudents(e: any) {
        e.preventDefault();
        this.existingStudents = [];
    }

    moveExistingStudent(student: any, e: any) {
        let studentToMove: ChangeUpdateRosterStudentsModel = new ChangeUpdateRosterStudentsModel();
        studentToMove.studentId = student.studentId;
        studentToMove.firstName = student.firstName;
        studentToMove.lastName = student.lastName;
        studentToMove.email = student.email;
        studentToMove.moveFromCohortId = student.cohortId;
        studentToMove.moveFromCohortName = student.cohortName;
        studentToMove.moveToCohortId = this.rosterChangesModel.cohortId;
        studentToMove.moveToCohortName = this.rosterChangesModel.cohortName;
        studentToMove.isInactive = !student.isActive;
        studentToMove.updateType = RosterUpdateTypes.MoveToThisCohort;
        studentToMove.addedFrom = RosterUpdateTypes.AddToThisCohort;
        this.moveExistingStudentEvent.emit(studentToMove);
        _.remove(this.existingStudents, { 'studentId': +studentToMove.studentId });
    }

    updateUntimed(student: ChangeUpdateRosterStudentsModel, e: any) {
        this.updateUntimedEvent.emit({
            student: student,
            checked: e.target.checked
        });
        console.log(this.rosterChangesModel);
    }

    updateRepeater(student: ChangeUpdateRosterStudentsModel, e: any): void {
        this.updateRepeaterEvent.emit({
            student: student,
            checked: e.target.checked
        });
        console.log(this.rosterChangesModel);
    }

    removeMovedStudent(student: ChangeUpdateRosterStudentsModel, e: any) {
        e.preventDefault();
        this.removeMovedStudentEvent.emit(student);
    }

    updateAddedStudentUntimed(student: ChangeUpdateRosterStudentsModel, e: any) {
        this.updateAddedStudentUntimedEvent.emit({
            student: student,
            checked: e.target.checked
        });
    }

}
