import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { links, RosterUpdateTypes } from '../../constants/config';
import { RosterService } from './roster.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Response } from '@angular/http';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';
import * as _ from 'lodash';
import { reset_student_password, rosters } from '../../constants/error-messages';


@Component({
    selector: 'rosters-move',
    templateUrl: './rosters-change-move-to-cohort.component.html',
    styleUrls: ['./rosters-change-move-to-cohort.component.css'],
    host: {
        '(window:resize)': 'resize($event)'
    }
})
export class RosterChangeMoveToCohortComponent implements OnInit {
    searchString: string;
    prevSearchText: string;
    searchStudentsSubscription: Subscription;
    typeahead: any;
    collapsed: boolean = true;
    searchedStudents: Array<any>;
    boundStudents: Array<any>;
    rosterUpdateType: number = RosterUpdateTypes.MoveToThisCohort;
    addedFromType: number = RosterUpdateTypes.MoveToThisCohort;
    @Input() rosterChangesModel: RosterChangesModel;
    @Output() moveToCohort = new EventEmitter();
    @Output() removeEvent = new EventEmitter();
    @Output() updateUntimedEvent = new EventEmitter();
    @Output() updateRepeaterEvent = new EventEmitter();
    noStudents: boolean = false;
    noStudentsErrorMessage: string = rosters.no_students;
    showExpiredMessage: boolean = false;
    expiredMessage: string = rosters.expired_message;
    constructor(
        private common: CommonService,
        private rosterService: RosterService,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        // $(document).trigger("enhance.tablesaw");
        this.showPanels();
        this.toggleTd();

    }

    resize(e) {
        // $(document).trigger("enhance.tablesaw");
        this.toggleTd();
    }

    showPanels() {
        this.collapsed = !_.some(this.rosterChangesModel.students,{ 'updateType': +RosterUpdateTypes.MoveToThisCohort, 'addedFrom': +RosterUpdateTypes.MoveToThisCohort })
    }

    searchStudents(studentName: string, buttonTriggered: boolean = false) {
        this.noStudents = false;
        this.searchString = studentName;
        let self = this;
        if ((this.searchString.length === 2 && this.prevSearchText != this.searchString)
            || (this.prevSearchText === '' && this.searchString.length >= 2)
            || (this.searchString.length >= 2 && this.prevSearchText.length > this.searchString.length)
            || (this.searchString.length >= 2 && !_.startsWith(this.searchString, this.prevSearchText) && this.prevSearchText != this.searchString)) {
            this.prevSearchText = this.searchString;

            let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.moveToCohortStudents}`;
            url = url.replace("§institutionId", this.rosterChangesModel.institutionId.toString()).replace("§cohortId", this.rosterChangesModel.cohortId.toString()).replace('§searchString', this.searchString);

            let searchStudentsObservable: Observable<Response> = this.rosterService.searchStudents(url);
            this.searchStudentsSubscription = searchStudentsObservable
                .map(response => response.json())
                .finally(() => {
                    if (buttonTriggered) {
                        $('.typeahead').typeahead('close');
                        this.bindStudents();
                    }

                })
                .subscribe((json: any) => {
                    if (json) {
                        let typeaheadSource: Array<string> = [];
                        if (json) {
                            this.searchedStudents = json;
                            for (var i = 0; i < json.length; i++) {
                                typeaheadSource.push(json[i].FirstName + ' ' + json[i].LastName);
                            }
                        }
                        // if (json.InactiveOrExpired) {
                        //     for (var i = 0; i < json.InactiveOrExpired.length; i++) {
                        //         typeaheadSource.push(json.InactiveOrExpired[i].FirstName + ' ' + json.InactiveOrExpired[i].LastName);
                        //     }
                        // }
                        if (this.typeahead) {
                            $('.typeahead').typeahead('destroy');
                        }

                        let source = new Bloodhound({
                            local: typeaheadSource,
                            queryTokenizer: Bloodhound.tokenizers.whitespace,
                            datumTokenizer: Bloodhound.tokenizers.whitespace
                        });
                        this.typeahead = $('.typeahead').typeahead({
                            hint: false,
                            highlight: true,
                            minLength: 2,
                        },
                            {
                                name: 'cohort',
                                source: source,
                                limit: Number.MAX_VALUE
                            });
                        $('.typeahead').focus();
                        $('.typeahead').on('typeahead:select', function (ev, suggestion) {
                            self.searchString = suggestion;
                            self.bindStudents();
                            ev.preventDefault();
                        });
                    }
                },
                error => {

                });
        }
    }


    private filterStudents(searchStudents: Array<any>, searchString: string): Array<any> {
        return _.filter(searchStudents, (student: any) => {
            let fullName = (student.FirstName + ' ' + student.LastName).toUpperCase();
            return fullName.indexOf(searchString.toUpperCase()) != -1
        });
    }

    private mapStudents(students: Array<any>): Array<any> {
        return _.map(students, (student: any) => {
            return {
                moveFromCohortId: student.CohortId,
                moveFromCohortName: student.CohortName,
                moveFromCohortExpired: (!!student.CohortEndDate && moment(student.CohortEndDate).isBefore(new Date())) || (!!student.UserExpireDate && moment(student.UserExpireDate).isBefore(new Date())),
                studentId: student.StudentId,
                firstName: student.FirstName,
                lastName: student.LastName,
                updateType: RosterUpdateTypes.MoveToThisCohort,
                moved: this.isStudentMoved(student.StudentId),
                isActive: student.IsActiveCohort,
                sameCohort: !!(student.CohortId === this.rosterChangesModel.cohortId),
                buttonText : this.getButtonText((!!student.CohortEndDate && moment(student.CohortEndDate).isBefore(new Date())) || (!!student.UserExpireDate && moment(student.UserExpireDate).isBefore(new Date())), !!(student.CohortId === this.rosterChangesModel.cohortId))
            }
        });
    }

    protected getButtonText(expired: boolean, sameCohort: boolean): string {
        if (expired)
            return rosters.btn_access_expired;
        else if (sameCohort)
            return rosters.btn_same_cohort;            
        return `Request move to this cohort`;
    }



    bindStudents(): void {
        let __this = this;
        this.boundStudents = [];
        if (this.searchedStudents && this.searchedStudents.length > 0) {
            this.boundStudents = this.mapStudents(this.filterStudents(this.searchedStudents, this.searchString));
            if (this.boundStudents.length === 0)
                this.noStudents = true;
            else
                this.noStudents = false;
            this.showExpiredMessage = _.some(this.boundStudents, 'moveFromCohortExpired');
            setTimeout(function () {
                // $(document).trigger("enhance.tablesaw");
                __this.toggleTd();
            });
            console.log(this.boundStudents);
        }
        else
            this.noStudents = true;


    }

    searchButtonClick(searchString: string, e: any): void {
        e.preventDefault();
        // this.searchString = searchString;
        // this.bindStudents();

        this.searchString = '';
        this.prevSearchText = '';
        this.searchStudents(searchString, true);

    }

    move(student: ChangeUpdateRosterStudentsModel, e: any) {
        let __this = this;
        e.preventDefault();
        student.addedFrom = RosterUpdateTypes.MoveToThisCohort;
        this.moveToCohort.emit(Object.assign({}, student));
        let movedStudent: any = _.find(this.boundStudents, { 'studentId': student.studentId });
        if (!!movedStudent)
            movedStudent.moved = this.isStudentMoved(student.studentId);
        console.log(this.rosterChangesModel.students);
        setTimeout(function () {
            __this.toggleTd();
        });
    }


    private isStudentMoved(studentId: number): boolean {
        let selectedStudent: any = _.find(this.rosterChangesModel.students, { 'studentId': studentId });
        return !!selectedStudent;
    }

    remove(student: ChangeUpdateRosterStudentsModel, e): void {
        e.preventDefault();
        this.removeEvent.emit(student);
        let movedStudent: any = _.find(this.boundStudents, { 'studentId': student.studentId });
        if (!!movedStudent)
            movedStudent.moved = this.isStudentMoved(student.studentId);
        console.log(this.rosterChangesModel);
    }

    updateUntimed(student: ChangeUpdateRosterStudentsModel, e: any): void {
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
    }

    toggleTd() {
        $('tr td:first-child').unbind('click');
        $('tr td:first-child').on('click', function () {
            var $firstTd = $(this);
            var $tr = $(this).parent('tr');
            var $hiddenTd = $tr.find('td').not($(this));
            $tr.toggleClass('tablesaw-stacked-hidden-border');
            $hiddenTd.toggleClass('tablesaw-stacked-hidden');
        });
    }

    clearSearchResults(searchInput, e) {
        e.preventDefault();
        searchInput.value = '';
        this.boundStudents = [];
        this.searchedStudents = [];
        this.searchString = '';
        this.prevSearchText = '';
        this.showExpiredMessage = false;
        $('.typeahead').typeahead('destroy');
    }

}
