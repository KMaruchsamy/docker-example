import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { links, RosterUpdateTypes } from '../../constants/config';
import { RosterService } from './roster.service';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/map';
import { RosterChangesModel } from '../../models/roster-changes.model';
import { ChangeUpdateRosterStudentsModel } from '../../models/change-update-roster-students.model';

import { rosters } from '../../constants/error-messages';

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
    showDuplicateStudentMessage: boolean = false;
    constructor(
        private common: CommonService,
        private rosterService: RosterService    ) { }

    ngOnInit() {
        // $(document).trigger("enhance.tablesaw");
        this.showPanels();
        this.toggleTd();
        this.bindPopover();
    }


    bindPopover() {
        $('body').on('hidden.bs.popover', function (e) {
            $(e.target).data("bs.popover").inState.click = false;
        });

        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }

    resize(e) {
        // $(document).trigger("enhance.tablesaw");
        this.toggleTd();
    }

    showPanels() {
        this.collapsed = !_.some(this.rosterChangesModel.students, { 'updateType': +RosterUpdateTypes.MoveToThisCohort, 'addedFrom': +RosterUpdateTypes.MoveToThisCohort })
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

            let searchStudentsObservable  = this.rosterService.searchStudents(url);
            this.searchStudentsSubscription = searchStudentsObservable
                .map(response => response.body)
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
                studentId: student.StudentId,
                firstName: student.FirstName,
                lastName: student.LastName,
                email: student.Email,
                updateType: RosterUpdateTypes.MoveToThisCohort,
                moved: this.isStudentMoved(student.StudentId),
                isActive: student.IsActiveCohort,
                sameCohort: !!(student.CohortId === this.rosterChangesModel.cohortId),
                buttonText: this.getButtonText(!!(student.CohortId === this.rosterChangesModel.cohortId)),
                duplicate: this.checkDuplicate(students, student)
            }
        });
    }

    checkDuplicate(students: Array<any>, duplicateStudent: any): boolean {
        return _.some(students, (student) => {
            return (student.StudentId !== duplicateStudent.StudentId)
                && (student.FirstName.toLowerCase() === duplicateStudent.FirstName.toLowerCase())
                && (student.LastName.toLowerCase() === duplicateStudent.LastName.toLowerCase())
        });
    }

    protected getButtonText(sameCohort: boolean): string {
        if (sameCohort)
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
            this.showDuplicateStudentMessage = _.some(this.boundStudents, 'duplicate');
            setTimeout(function () {
                // $(document).trigger("enhance.tablesaw");
                $('[data-toggle="popover"]').popover();
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
        student.moveToCohortId = this.rosterChangesModel.cohortId;
        student.moveToCohortName = this.rosterChangesModel.cohortName;
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
        $('#moveExisting tr td:first-child, #searchResultsTable tr td:first-child').unbind('click');
        $('#moveExisting tr td:first-child, #searchResultsTable tr td:first-child').on('click', function () {
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
        this.showDuplicateStudentMessage = false;
        $('.typeahead').typeahead('destroy');
    }

}
