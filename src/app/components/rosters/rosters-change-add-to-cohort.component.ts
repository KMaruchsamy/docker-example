import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnChanges } from '@angular/core';
import { ValidationsService } from '../../services/validations.service';
import { RosterUpdateTypes, errorcodes } from '../../constants/config';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import { RosterService } from './roster.service';
import { links } from '../../constants/config';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs/Rx';
import { rosters, general } from '../../constants/error-messages';
import { RosterChangesModel } from '../../models/roster-changes.model';

@Component({
    selector: 'rosters-add-to-cohort',
    templateUrl: './rosters-change-add-to-cohort.component.html',
    styleUrls: ['./rosters-change-move-to-cohort.component.css']
})
export class RosterChangeAddToCohortComponent implements OnInit, AfterViewInit {
    collapsed: boolean = true;
    @Input() rosterChangesModel:RosterChangesModel;
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
    errorMessage: string;
    showExpiredMessage: boolean = false;
    expiredMessage: string = rosters.expired_message;
    constructor(private common: CommonService, private validations: ValidationsService, private rosterSerivice: RosterService) { }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.bindTablesaw('addTable', this);
        this.bindTablesaw('moveTable', this);
        this.bindTablesaw('alreadyExistsStudent', this);
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
            this.errorMessage = rosters.student_already_added;
            return;
        }

        let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.addEmailValidation}`;
        url = url.replace("§institutionId", this.rosterChangesModel.institutionId.toString()).replace('§searchEmailId', this.email);
        let __this = this;
        let emailValidateObservable = this.rosterSerivice.addEmailValidation(url);
        this.emailValidateSubscription = emailValidateObservable
            .map(response => response.json())
            .subscribe((json: any) => {
                if (json && json.length > 0) {
                    let existingStudent: any = {};
                    json.forEach(e => {
                        if (e.InstitutionId === +__this.rosterChangesModel.institutionId) {
                            existingStudent.studentId = e.StudentId;
                            existingStudent.firstName = e.FirstName;
                            existingStudent.lastName = e.LastName;
                            existingStudent.email = e.Email;
                            existingStudent.moveFromCohortId = e.CohortId;
                            existingStudent.moveFromCohortName = e.CohortName;
                            existingStudent.expired = ((!!e.CohortEndDate && moment(e.CohortEndDate).isBefore(new Date())) || (!!e.UserExpireDate && moment(e.UserExpireDate).isBefore(new Date())));
                            existingStudent.sameCohort = (e.CohortId === __this.rosterChangesModel.cohortId);
                            this.existingStudents.push(existingStudent);
                            this.showExpiredMessage = _.some(this.existingStudents, 'expired');
                            this.bindTablesaw('alreadyExistsStudent', __this);
                        }
                    });
                }
                else {
                    __this.addToCohortEvent.emit({
                        firstName: this.firstName,
                        lastName: this.lastName,
                        email: this.email,
                        unTimedTest: this.untimed,
                        updateType: RosterUpdateTypes.AddToThisCohort,
                        addedFrom: RosterUpdateTypes.AddToThisCohort
                    });
                    this.bindTablesaw('addTable', __this);
                }
            }, (error) => {
                if (+error.status === +errorcodes.API)
                    __this.errorMessage = error.json().msg;
                else
                    __this.errorMessage = general.exception;
                this.checkValid();
            }, () => {
                this.resetModal();
                this.checkValid();
            });


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
        this.showExpiredMessage = false;
        this.existingStudents = [];
    }

    moveExistingStudent(student: any, e: any) {
        let __this = this;
        let studentToMove: ChangeUpdateRosterStudentsModel = new ChangeUpdateRosterStudentsModel();
        studentToMove.studentId = student.studentId;
        studentToMove.firstName = student.firstName;
        studentToMove.lastName = student.lastName;
        studentToMove.email = student.email;
        studentToMove.moveFromCohortId = student.moveFromCohortId;
        studentToMove.moveFromCohortName = student.moveFromCohortName;
        studentToMove.moveToCohortId = this.rosterChangesModel.cohortId;
        studentToMove.moveToCohortName = this.rosterChangesModel.cohortName;
        studentToMove.isInactive = !student.isActive;
        studentToMove.updateType = RosterUpdateTypes.MoveToThisCohort;
        studentToMove.addedFrom = RosterUpdateTypes.AddToThisCohort;
        this.moveExistingStudentEvent.emit(studentToMove);
        _.remove(this.existingStudents, { 'studentId': +studentToMove.studentId });
        this.bindTablesaw('moveTable', __this);
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

    bindTablesaw(tableId: string, __this: any) {
        setTimeout(function () {
            // $(document).trigger("enhance.tablesaw");
            __this.toggleTd(tableId);
        });
    }

    toggleTd(tableId: string) {
        let $td = $('#' + tableId).find('tr td:first-child');
        $td.unbind('click');
        $td.on('click', function () {
            var $tr = $(this).parent('tr');
            var $hiddenTd = $tr.find('td').not($(this));
            $tr.toggleClass('tablesaw-stacked-hidden-border');
            $hiddenTd.toggleClass('tablesaw-stacked-hidden');
        });
    }

}
