import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
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
import { reset_student_password } from '../../constants/error-messages';


@Component({
    selector: 'rosters-move',
    templateUrl: 'rosters-change-move-to-cohort.component.html',
    styleUrls: ['./rosters-change-move-to-cohort.css']
})
export class RosterChangeMoveToCohortComponent implements OnInit {
    searchString: string;
    prevSearchText: string;
    searchStudentsSubscription: Subscription;
    typeahead: any;
    collapsed: boolean = true;
    searchedStudents: Array<any>;
    boundStudents: Array<any>;
    @Input() rosterChangesModel: RosterChangesModel;
    @Output() moveToCohort = new EventEmitter();
    @Output() removeEvent = new EventEmitter();
    @Output() updateUntimedEvent = new EventEmitter();
    @Output() updateRepeaterEvent = new EventEmitter();

    constructor(
        private common: CommonService,
        private rosterService: RosterService,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
    }

    searchStudents(studentName: string) {
        this.searchString = studentName;
        let self = this;
        if ((this.searchString.length === 2 && this.prevSearchText != this.searchString)
            || (this.prevSearchText === '' && this.searchString.length >= 2)
            || (this.searchString.length >= 2 && this.prevSearchText.length > this.searchString.length)
            || (this.searchString.length >= 2 && !_.startsWith(this.searchString, this.prevSearchText) && this.prevSearchText != this.searchString)) {
            this.prevSearchText = this.searchString;
            // let url: string = `${this.common.getApiServer()}${links.api.baseurl}${links.api.admin.rosters.search}`;
            // url = url.replace("§institutionId", this.rosterChangesModel.institutionId.toString()).replace('§searchString', this.searchString);

            let url: string = "assets/json/tempdata.json";            

            let searchStudentsObservable: Observable<Response> = this.rosterService.searchStudents(url);
            this.searchStudentsSubscription = searchStudentsObservable
                .map(response => response.json())
                .subscribe((json: any) => {
                    debugger;
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
                        $('.typeahead').on('typeahead:select', function(ev, suggestion) {
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
                updateType: RosterUpdateTypes.MoveToThisCohort,
                moved: this.isStudentMoved(student.StudentId),
                isActive: student.IsActive                
            }
        });
    }



    bindStudents(): void {
        this.boundStudents = null;
        if (this.searchStudents && this.searchStudents.length > 0) {
            this.boundStudents = this.mapStudents(this.filterStudents(this.searchedStudents, this.searchString));
        }

    }

    searchButtonClick(searchString: string, e: any): void {
        e.preventDefault();
        this.searchString = searchString;
        this.bindStudents();
        $('.typeahead').typeahead('close');
    }

    move(student: ChangeUpdateRosterStudentsModel, e: any) {
        e.preventDefault();
        this.moveToCohort.emit(student);
        let movedStudent: any = _.find(this.boundStudents, { 'studentId': student.studentId });
        if (!!movedStudent)
            movedStudent.moved = this.isStudentMoved(student.studentId);
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

    updateRepeater(student: ChangeUpdateRosterStudentsModel, e:any): void {
        this.updateRepeaterEvent.emit({
            student: student,
            checked: e.target.checked
        });
    }



}